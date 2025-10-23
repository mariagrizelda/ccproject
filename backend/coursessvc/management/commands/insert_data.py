from django.core.management.base import BaseCommand
from coursessvc.models import Course, CoursePrerequisite, Assessment


class Command(BaseCommand):
    help = "Insert placeholder data for Courses, CoursePrerequisites, and Assessments."

    def handle(self, *args, **options):
        course1, _ = Course.objects.get_or_create(
            code="COMP1100",
            defaults=dict(
                name="Introduction to Software Innovation",
                level=1,
                credits=2,
                aim="""This course aims to introduce the fundamentals of innovation in computer science and information technology through a discipline-specific team project. Students will learn what innovation is, processes that innovators follow, how innovation teams work together, how to make decisions in technology projects, how to use prototyping in the innovation process and the tools required to successfully deliver and communicate an innovation project. This course provides the foundations to further courses in computer science and information technology programs.""",
                assessment_type=Course.AssessmentType.ASSIGNMENT,
                study_area=Course.StudyArea.EAIT,
                offered_sem_1=True,
                offered_sem_2=True,
                offered_summer=False,
                description="""Introduction to innovation using computer science and information technology through a discipline-specific team project. Students will learn what innovation is, processes that innovators follow, how innovation teams work together, how to make decisions in technology projects, how to use prototyping in the innovation process and the tools required to successfully deliver and communicate an innovation project.\n
                This is the third offering of the course. There are no specific changes to this course compared to the course description or previous offerings of this course.""",
            ),
        )

        Assessment.objects.get_or_create(
            course=course1,
            category="Participation/ Student contribution, Practical/ Demonstration, Presentation, Role play/ Simulation",
            task="Studio participation",
            mode="Activity/ Performance, Oral, Product/ Artefact/ Multimedia",
            grading_type=Assessment.GradingType.PASS_FAIL,
            description="""Participation in the weekly seminar and studios, including presentation and practice sessions.
This task has been designed to be challenging, authentic and complex. Whilst students may use AI and/or MT technologies, successful completion of assessment in this course will require students to critically engage in specific contexts and tasks for which artificial intelligence will provide only limited support and guidance.
A failure to reference generative AI or MT use may constitute student misconduct under the Student Code of Conduct.
To pass this assessment, students will be required to demonstrate detailed comprehension of their submission independent of AI and MT tools.""",
            hurdle=True,
            hurdle_description="""Students must attend and participate each of the weeks listed above. If there are exceptional circumstances and you are unable to attend, you must inform your team and your supervisor *before* the studio that you will be unable to attend, and provide relevant evidence to your supervisor. The course coordinator will work with you and your supervisor to determine alternative assessment to demonstrate learning outcomes.""",
        )

        Assessment.objects.get_or_create(
            course=course1,
            category="Paper/ Report/ Annotation, Product/ Design, Reflection",
            task="Business model canvas iteration 1",
            mode="Written",
            grading_type=Assessment.GradingType.PASS_FAIL,
            description="""A team report outlining the customer discovery findings from the first iteration of the process.
A short individual reflection from each student.
This task has been designed to be challenging, authentic and complex. Whilst students may use AI and/or MT technologies, successful completion of assessment in this course will require students to critically engage in specific contexts and tasks for which artificial intelligence will provide only limited support and guidance.
A failure to reference generative AI or MT use may constitute student misconduct under the Student Code of Conduct.
To pass this assessment, students will be required to demonstrate detailed comprehension of their submission independent of AI and MT tools.
Students will have one-on-one meetings with their supervisor to discuss their work throughout the semester.""",
            hurdle=True,
            hurdle_description="""This submission has both a team component, as well as a short individual self reflection. Students must achieve a Pass on both items to be eligible to Pass the course. Individual student contribution to the team component is determined by the logs in the source code repository.""",
        )

        Assessment.objects.get_or_create(
            course=course1,
            category="Paper/ Report/ Annotation, Product/ Design, Reflection",
            task="Business model canvas iteration 2",
            mode="Written",
            grading_type=Assessment.GradingType.PASS_FAIL,
            description="""A team report outlining the customer discovery findings from the second iteration of the process.
A short individual reflection from each student.
This task has been designed to be challenging, authentic and complex. Whilst students may use AI and/or MT technologies, successful completion of assessment in this course will require students to critically engage in specific contexts and tasks for which artificial intelligence will provide only limited support and guidance.
A failure to reference generative AI or MT use may constitute student misconduct under the Student Code of Conduct.
To pass this assessment, students will be required to demonstrate detailed comprehension of their submission independent of AI and MT tools.
Students will have one-on-one meetings with their supervisor to discuss their work throughout the semester.""",
            hurdle=True,
            hurdle_description="""This submission has both a team component, as well as a short individual self reflection. Students must achieve a Pass on both items to be eligible to Pass the course. Individual student contribution to the team component is determined by the logs in the source code repository.""",
        )

        Assessment.objects.get_or_create(
            course=course1,
            category="Computer Code, Paper/ Report/ Annotation, Practical/ Demonstration, Presentation, Product/ Design, Reflection",
            task="Code submission and business model canvas iteration 3",
            mode="Oral, Product/ Artefact/ Multimedia, Writtenp",
            grading_type=Assessment.GradingType.PASS_FAIL,
            description="""A team report outlining the customer discovery findings from the third iteration of the process.
An implemented conceptual prototype.
A short individual reflection from each student.
This task has been designed to be challenging, authentic and complex. Whilst students may use AI and/or MT technologies, successful completion of assessment in this course will require students to critically engage in specific contexts and tasks for which artificial intelligence will provide only limited support and guidance.
A failure to reference generative AI or MT use may constitute student misconduct under the Student Code of Conduct.
To pass this assessment, students will be required to demonstrate detailed comprehension of their submission independent of AI and MT tools.
Students will have one-on-one meetings with their supervisor to discuss their work throughout the semester.""",
            hurdle=True,
            hurdle_description="""This submission has both a team component, as well as a short individual self reflection. Students must achieve a Pass on both items to be eligible to Pass the course. Individual student contribution to the team component is determined by the logs in the source code repository."""
        )

        self.stdout.write(self.style.SUCCESS('Successfully inserted course data'))
