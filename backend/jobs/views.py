# backend/jobs/views.py 
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Job
from .serializers import JobSerializer


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
        status = params.get('status', '').strip()
        if status:
            qs = qs.filter(status=status)
            print(f"✓ Status filter '{status}': {qs.count()} jobs")

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
            from rest_framework import status
            from rest_framework.response import Response
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)