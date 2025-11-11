# backend/jobs/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timedelta

from .models import Job
from .serializers import JobSerializer

from rest_framework.decorators import action
from .models import JobApplication, JobApplicationAttachment
from .serializers import JobApplicationSerializer


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]  # Allow anyone to view
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    queryset = Job.objects.all().select_related('client').prefetch_related('attachments')

    def get_permissions(self):
        """
        Allow unauthenticated users to list and retrieve jobs.
        Require authentication for create, update, delete.
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    def get_queryset(self):
        qs = Job.objects.filter(visibility='public')
        params = self.request.query_params

        print("\n" + "="*50)
        print("JOBS FILTER REQUEST")
        print("="*50)
        print(f"Initial queryset count: {qs.count()}")
        print(f"Params received: {dict(params)}")
        print("-"*50)

        # Status filter
        status_param = params.get('status', '').strip()
        if status_param:
            qs = qs.filter(status=status_param)
            print(f"✓ Status filter '{status_param}': {qs.count()} jobs")

        # Job type filter
        job_types = params.get('job_type', '').strip()
        if job_types:
            job_type_list = [j.strip() for j in job_types.split(',') if j.strip()]
            if job_type_list:
                qs = qs.filter(job_type__in=job_type_list)
                print(f"✓ Job type filter {job_type_list}: {qs.count()} jobs")

        # Experience level filter
        experience = params.get('experience_level', '').strip()
        if experience:
            exp_list = [e.strip() for e in experience.split(',') if e.strip()]
            if exp_list:
                qs = qs.filter(experience_level__in=exp_list)
                print(f"✓ Experience filter {exp_list}: {qs.count()} jobs")

        # Posted time filter
        posted_time = params.get('posted_time', '').strip()
        if posted_time:
            now = datetime.now()
            if posted_time == '24h':
                qs = qs.filter(created_at__gte=now - timedelta(hours=24))
            elif posted_time == 'week':
                qs = qs.filter(created_at__gte=now - timedelta(days=7))
            elif posted_time == 'month':
                qs = qs.filter(created_at__gte=now - timedelta(days=30))
            print(f"✓ Posted time filter '{posted_time}': {qs.count()} jobs")

        # Hourly rate filter
        min_rate = params.get('hourly_min', '').strip()
        max_rate = params.get('hourly_max', '').strip()
        if min_rate:
            try:
                qs = qs.filter(hourly_min__gte=float(min_rate))
                print(f"✓ Min hourly rate ≥ ₹{min_rate}: {qs.count()} jobs")
            except ValueError:
                print("⚠ Invalid min_rate value")
        if max_rate:
            try:
                qs = qs.filter(hourly_max__lte=float(max_rate))
                print(f"✓ Max hourly rate ≤ ₹{max_rate}: {qs.count()} jobs")
            except ValueError:
                print("⚠ Invalid max_rate value")

        # Location filter
        location = params.get('location', '').strip()
        if location:
            qs = qs.filter(location__icontains=location)
            print(f"✓ Location filter '{location}': {qs.count()} jobs")

        # Location type filter
        location_type = params.get('location_type', '').strip()
        if location_type:
            loc_list = [l.strip() for l in location_type.split(',') if l.strip()]
            if loc_list:
                qs = qs.filter(location_type__in=loc_list)
                print(f"✓ Location type filter {loc_list}: {qs.count()} jobs")

        # Search filter
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            ).distinct()
            print(f"✓ Search filter '{search}': {qs.count()} jobs")

        print("-"*50)
        print(f"FINAL RESULT: {qs.count()} jobs")
        print("="*50 + "\n")

        return qs

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        if job.client != request.user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user

        if getattr(user, 'role', None) == 'freelancer':
            queryset = JobApplication.objects.filter(freelancer=user)
        elif getattr(user, 'role', None) == 'client':
            queryset = JobApplication.objects.filter(job__client=user)
        else:
            queryset = JobApplication.objects.none()

        print(f"[Job Applications] User: {getattr(user, 'email', 'unknown')}, Role: {getattr(user, 'role', 'unknown')}, Count: {queryset.count()}")

        return queryset.select_related('job', 'freelancer').prefetch_related('attachments').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if job is still open
        if job.status != 'open':
            return Response(
                {'detail': 'This job is no longer accepting applications.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if freelancer already submitted an application
        existing_application = JobApplication.objects.filter(
            job=job,
            freelancer=request.user
        ).first()

        if existing_application:
            return Response(
                {'detail': 'You have already submitted an application for this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create application
        application_data = {
            'job': job.id,
            'cover_letter': request.data.get('cover_letter'),
            'bid_amount': request.data.get('bid_amount'),
            'estimated_time': request.data.get('estimated_time'),
        }

        serializer = self.get_serializer(data=application_data)
        if serializer.is_valid():
            application = serializer.save(freelancer=request.user)

            # Handle file attachments
            files = request.FILES.getlist('attachments')
            for f in files[:3]:  # Max 3 files
                JobApplicationAttachment.objects.create(
                    application=application,
                    file=f,
                    original_name=getattr(f, 'name', ''),
                    size=getattr(f, 'size', 0)
                )

            # Create notification for client
            try:
                from notifications.models import Notification
                Notification.objects.create(
                    user=job.client,
                    type='job_application',
                    title='New Job Application',
                    message=f'{request.user.get_full_name()} applied for your job: {job.title}',
                    metadata={
                        'job_id': job.id,
                        'application_id': application.id,
                        'freelancer_id': request.user.id
                    }
                )
            except Exception:
                pass  # Skip if notifications app doesn't exist

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        application = self.get_object()
        if application.job.client != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        # Reject all other pending applications
        JobApplication.objects.filter(
            job=application.job,
            status='pending'
        ).exclude(id=application.id).update(status='rejected')

        application.status = 'accepted'
        application.save()

        # Create notification for freelancer
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=application.freelancer,
                type='job_application',
                title='Application Accepted',
                message=f'Your application for "{application.job.title}" has been accepted!',
                metadata={
                    'job_id': application.job.id,
                    'application_id': application.id,
                    'client_id': request.user.id
                }
            )
        except Exception:
            pass

        # Create contract
        try:
            from contracts.models import Contract
            Contract.objects.get_or_create(
                job_application=application,
                defaults={
                    'terms': 'Job terms as discussed',
                    'payment_terms': 'Payment on completion'
                }
            )
        except Exception:
            pass  # Skip if contracts app doesn't exist or field not added yet

        return Response({'detail': 'Application accepted. Contract created.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        application = self.get_object()
        if application.job.client != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'rejected'
        application.save()

        # Create notification for freelancer
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=application.freelancer,
                type='job_application',
                title='Application Rejected',
                message=f'Your application for "{application.job.title}" was not accepted.',
                metadata={
                    'job_id': application.job.id,
                    'application_id': application.id
                }
            )
        except Exception:
            pass

        return Response({'detail': 'Application rejected.'}, status=status.HTTP_200_OK)
