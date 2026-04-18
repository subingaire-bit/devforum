// Licensed under MIT - DevForum Project
import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { QuestionForm } from "@/components/questions/question-form";

export default async function NewQuestionPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login?callbackUrl=/questions/new");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ask a Question</h1>
        <p className="text-muted-foreground mt-2">
          Be specific and imagine you&apos;re asking another person.
        </p>
      </div>
      <QuestionForm />
    </div>
  );
}