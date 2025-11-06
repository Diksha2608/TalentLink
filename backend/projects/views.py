from django.db.models import Q, Count
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    queryset = Project.objects.all()

    def get_queryset(self):
        """
        Filter projects based on multiple criteria.
        Returns queryset of filtered projects.
        """
        # Start with base queryset - only public projects
        qs = Project.objects.filter(visibility='public')
        
        # Annotate with proposal count for filtering
        qs = qs.annotate(num_proposals=Count('proposals'))
        
        # Get query parameters
        params = self.request.query_params

        # ==========================================
        # DEBUG LOGGING (remove in production)
        # ==========================================
        print("\n" + "="*50)
        print("FILTER REQUEST")
        print("="*50)
        print(f"Initial queryset count: {qs.count()}")
        print(f"Params received: {dict(params)}")
        print("-"*50)

        # ==========================================
        # 1. STATUS FILTER
        # ==========================================
        status = params.get("status", "").strip()
        if status:
            qs = qs.filter(status=status)
            print(f"✓ Status filter '{status}': {qs.count()} projects")

        # ==========================================
        # 2. DURATION FILTER (Project Length)
        # ==========================================
        duration = params.get("duration", "").strip()
        if duration:
            duration_list = [d.strip() for d in duration.split(",") if d.strip()]
            if duration_list:
                qs = qs.filter(duration__in=duration_list)
                print(f"✓ Duration filter {duration_list}: {qs.count()} projects")

        # ==========================================
        # 3. HOURS PER WEEK FILTER
        # ==========================================
        hours_per_week = params.get("hours_per_week", "").strip()
        if hours_per_week:
            hours_list = [h.strip() for h in hours_per_week.split(",") if h.strip()]
            if hours_list:
                qs = qs.filter(hours_per_week__in=hours_list)
                print(f"✓ Hours/week filter {hours_list}: {qs.count()} projects")

        # ==========================================
        # 4. PROPOSAL COUNT FILTER
        # ==========================================
        proposal_range = params.get("proposal_range", "").strip()
        if proposal_range:
            proposal_list = [p.strip() for p in proposal_range.split(",") if p.strip()]
            if proposal_list:
                proposal_query = Q()
                for val in proposal_list:
                    if val == "0":
                        proposal_query |= Q(num_proposals=0)
                    elif val == "1_5":
                        proposal_query |= Q(num_proposals__gte=1, num_proposals__lte=5)
                    elif val == "6_15":
                        proposal_query |= Q(num_proposals__gte=6, num_proposals__lte=15)
                    elif val == "15_30":
                        proposal_query |= Q(num_proposals__gte=15, num_proposals__lte=30)
                    elif val == "30_plus":
                        proposal_query |= Q(num_proposals__gt=30)
                
                if proposal_query:
                    qs = qs.filter(proposal_query)
                    print(f"✓ Proposal filter {proposal_list}: {qs.count()} projects")

        # ==========================================
        # 5. JOB TYPE & PAYMENT FILTERS (UPDATED)
        # ==========================================
        job_types_param = params.get("job_type", "").strip()

        if job_types_param:
            job_types_list = [j.strip() for j in job_types_param.split(",") if j.strip()]
            print(f"\nJob types selected: {job_types_list}")

            combined_query = Q()

            # -------------------------
            # FIXED PRICE JOB FILTER
            # -------------------------
            if "fixed" in job_types_list:
                fixed_param = (
                    params.get("fixed_payment")
                    or params.get("budget_range")  # fallback key
                    or ""
                ).strip()

                if fixed_param:
                    fixed_ranges = [r.strip() for r in fixed_param.split(",") if r.strip()]
                    print(f"  Fixed ranges: {fixed_ranges}")

                    fixed_query = Q()
                    for r in fixed_ranges:
                        if r == "less_1000":
                            fixed_query |= Q(budget_max__lt=1000)
                        elif r == "1000_5000":
                            fixed_query |= Q(budget_min__gte=1000, budget_max__lte=5000)
                        elif r == "5000_10000":
                            fixed_query |= Q(budget_min__gte=5000, budget_max__lte=10000)
                        elif r == "10000_25000":
                            fixed_query |= Q(budget_min__gte=10000, budget_max__lte=25000)
                        elif r == "25000_plus":
                            fixed_query |= Q(budget_min__gt=25000)

                    combined_query |= Q(job_type="fixed") & fixed_query
                    debug_fixed = Project.objects.filter(Q(job_type="fixed") & fixed_query)
                    print(f"  → Fixed (budget) filter matched: {debug_fixed.count()} projects")
                else:
                    print("  No fixed_payment range provided → include all fixed projects")
                    combined_query |= Q(job_type="fixed")

            # -------------------------
            # HOURLY JOB FILTER
            # -------------------------
            if "hourly" in job_types_list:
                min_rate = params.get("hourly_min", "").strip()
                max_rate = params.get("hourly_max", "").strip()
                print(f"  Hourly filters: min={min_rate}, max={max_rate}")

                hourly_query = Q(job_type="hourly")

                try:
                    if min_rate:
                        hourly_query &= Q(hourly_min__gte=int(min_rate))
                        print(f"    ✓ Min hourly ≥ ₹{min_rate}")
                    if max_rate:
                        hourly_query &= Q(hourly_max__lte=int(max_rate))
                        print(f"    ✓ Max hourly ≤ ₹{max_rate}")
                except ValueError:
                    print("    ⚠ Invalid hourly range input detected")

                debug_hourly = Project.objects.filter(hourly_query)
                print(f"  → Hourly filter matched: {debug_hourly.count()} projects")

                combined_query |= hourly_query

            # -------------------------
            # APPLY COMBINED FILTER
            # -------------------------
            if combined_query:
                before = qs.count()
                qs = qs.filter(combined_query)
                after = qs.count()
                print(f"\n✓ Job type filter applied: {before} → {after} projects")
            else:
                print("\n⚠ No valid job type query built")

        # ==========================================
        # 6. SEARCH FILTER
        # ==========================================
        search = params.get("search", "").strip()
        if search:
            search_query = (
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(skills_required__name__icontains=search)
            )
            qs = qs.filter(search_query).distinct()
            print(f"✓ Search filter '{search}': {qs.count()} projects")

        # ==========================================
        # FINAL RESULT
        # ==========================================
        print("-"*50)
        print(f"FINAL RESULT: {qs.count()} projects")
        print("="*50 + "\n")

        return qs
