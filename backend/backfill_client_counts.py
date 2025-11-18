from django.contrib.auth import get_user_model
from users.models import ClientProfile
from projects.models import Project
from jobs.models import Job

User = get_user_model()

ACTIVE_STATUSES = ['open', 'in_progress']
COMPLETED_STATUS = 'completed'

updated = 0

for profile in ClientProfile.objects.select_related('user'):
    client = profile.user

    # ----- Projects -----
    proj_qs = Project.objects.filter(client=client)
    projects_posted = proj_qs.count()
    active_projects = proj_qs.filter(status__in=ACTIVE_STATUSES).count()
    completed_projects = proj_qs.filter(status=COMPLETED_STATUS).count()

    # ----- Jobs -----
    job_qs = Job.objects.filter(client=client)
    jobs_posted = job_qs.count()
    active_jobs = job_qs.filter(status__in=ACTIVE_STATUSES).count()
    completed_jobs = job_qs.filter(status=COMPLETED_STATUS).count()

    ClientProfile.objects.filter(pk=profile.pk).update(
        projects_posted=projects_posted,
        active_projects=active_projects,
        completed_projects=completed_projects,
        jobs_posted=jobs_posted,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
    )

    updated += 1

print(f"Backfill complete. Updated {updated} client profiles.")
