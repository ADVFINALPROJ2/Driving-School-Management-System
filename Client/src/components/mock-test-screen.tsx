"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

const SAMPLE_QUESTIONS: Question[] = [
  { id: 1, text: "What does a red traffic light mean?", options: ["Go", "Stop", "Slow down", "Yield"], correctIndex: 1 },
  { id: 2, text: "What is the maximum speed limit in a residential area?", options: ["80 km/h", "60 km/h", "40 km/h", "20 km/h"], correctIndex: 2 },
  { id: 3, text: "When should you use your turn signals?", options: ["Only at night", "When changing lanes", "Never", "Only on highways"], correctIndex: 1 },
  { id: 4, text: "What does a yellow traffic light indicate?", options: ["Speed up", "Prepare to stop", "Stop immediately", "Go"], correctIndex: 1 },
  { id: 5, text: "Who has the right of way at an uncontrolled intersection?", options: ["The larger vehicle", "The vehicle on the right", "The faster vehicle", "The vehicle going straight"], correctIndex: 1 },
];

const PASS_THRESHOLD = 3;

export function MockTestScreen({ studentName, onComplete }: { studentName: string; onComplete?: (passed: boolean, score: number) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = SAMPLE_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / total) * 100);

  const handleAnswer = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const correct = SAMPLE_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length;
    setSubmitted(true);
    onComplete?.(correct >= PASS_THRESHOLD, correct);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQ(0);
    setSubmitted(false);
  };

  const correctCount = submitted ? SAMPLE_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length : 0;
  const passed = correctCount >= PASS_THRESHOLD;

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? <CheckCircle className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
            Mock Test Result — {studentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Score</span>
            <span className="text-2xl font-bold">{correctCount}/{total}</span>
          </div>
          <Progress value={(correctCount / total) * 100} className={cn("h-3", passed ? "bg-emerald-200" : "bg-red-200")} />
          <Badge variant={passed ? "success" : "destructive"} className="text-sm">
            {passed ? "PASSED — Theory requirement satisfied" : "FAILED — Score must be above 37/50 (minimum 3/5 correct)"}
          </Badge>
          {!passed && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertCircle className="mr-1 inline h-4 w-4" />
              You did not meet the passing threshold. Please review the material and retake the test.
            </div>
          )}
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((q) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div key={q.id} className={cn("rounded-md border p-3 text-sm", isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
                  <p className="font-medium">{q.text}</p>
                  <p className="text-xs text-muted-foreground">Your answer: {q.options[userAnswer] ?? "Not answered"}</p>
                  {!isCorrect && <p className="text-xs text-emerald-600">Correct answer: {q.options[q.correctIndex]}</p>}
                </div>
              );
            })}
          </div>
          <Button onClick={handleReset} variant="outline" className="w-full">Retake Test</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mock Examination — {studentName}</span>
          <Badge variant="warning">{answeredCount}/{total} Answered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">Passing threshold: {PASS_THRESHOLD}/{total} correct (equivalent to 38/50)</p>

        <div className="space-y-4">
          {SAMPLE_QUESTIONS.map((q) => (
            <div key={q.id} className="rounded-lg border p-4">
              <p className="mb-3 font-medium">Question {q.id}: {q.text}</p>
              <div className="grid gap-2">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(q.id, i)}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <span className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={answeredCount < total} className="w-full">
          Submit Test
        </Button>
        {answeredCount < total && (
          <p className="text-center text-xs text-muted-foreground">Answer all questions before submitting</p>
        )}
      </CardContent>
    </Card>
  );
}
