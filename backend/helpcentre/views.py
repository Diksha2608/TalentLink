# backend/helpcentre/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import google.generativeai as genai

class HelpCentreChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        question = request.data.get("question", "")
        if not question:
            return Response({"error": "Question is required"}, status=400)

        q_lower = question.lower()

        # Restrict topics – now also allows password/account/login questions
        allowed_keywords = [
            "talentlink", "hire", "freelancer", "client", "project",
            "support", "help", "issue", "problem", "complaint", "contact",
            "service", "hi", "hello", "account", "notification", "portfolio",
            "jobs", "job", "workspace", "contract", "proposal",
            "password", "reset", "login", "signin", "sign in", "sign up"
        ]

        if not any(w in q_lower for w in allowed_keywords):
            return Response(
                {"answer": "Sorry, I can only answer TalentLink-related questions."}
            )

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("models/gemini-2.5-flash")

            context_prompt = """
You are the TalentLink Help Centre AI Support Bot.
Respond only to questions related to TalentLink features, hiring, freelancers, client work, projects, accounts, passwords, and payments.

Below are examples of frequently asked questions and their style of answers:

Q: hi?
A: Hello! How can I assist you with TalentLink today?

Q: How do I reset my TalentLink password?
A: To reset your password:
1. Go to the Sign In page on TalentLink.
2. Click on "Forgot your password?".
3. Enter the email address linked to your account.
4. Open the reset link sent to your email.
5. Choose a new password and confirm it, then save.

Q: I need support / I need help immediately.
A: Please describe your difficulty. You can also visit the Contact Us page to get assistance from our support team.

Q: Can someone call me about my issue?
A: Sure. Please explain your difficulty and fill out the form on the Contact Us page. A support representative will connect with you shortly.

Q: Where can I submit a complaint?
A: You can submit complaints through the Contact Us page. Please explain your difficulty there and our team will address it quickly.

Q: I have an issue that is not listed here. What should I do?
A: Please type your difficulty and also reach out through the Contact Us page so our customer support personnel can help you directly.

Q: I can't solve my issue even after trying the steps.
A: No problem. Please describe your difficulty and visit the Contact Us page so our support team can assist you personally.

Q: How do I talk to customer service?
A: Simply share your difficulty in short, and our customer support personnel will assist you through the Contact Us page.

Q: Can I get personalised support?
A: Yes. Please share your difficulty and submit your details in the Contact Us page. Our team will respond as soon as possible.

Always give short, step-by-step and helpful answers.
If a question is not related to TalentLink, reply: "Sorry, I can only answer TalentLink-related questions."
"""

            response = model.generate_content(context_prompt + "\n\nUser: " + question)

            return Response({"answer": response.text})

        except Exception as e:
            return Response({"error": str(e)}, status=500)
