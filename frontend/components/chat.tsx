import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Message } from "@/types/types";
import { useAskQuestion, useIndexDetails } from "@/hooks/use-queries";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatProps {
  indexId: string;
  activeFiles: string[];
}

export default function Chat({ indexId, activeFiles }: ChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [previousVectorizedState, setPreviousVectorizedState] = useState<
    boolean | null
  >(null);

  const askQuestionMutation = useAskQuestion();
  const { data: indexDetails } = useIndexDetails(indexId);

  useEffect(() => {
    const isCurrentlyVectorized = indexDetails?.data?.vectorized ?? false;

    // Check if vectorization status changed from false to true
    if (previousVectorizedState === false && isCurrentlyVectorized) {
      const systemMessage: Message = {
        content:
          "Index embedded successfully. You can now ask questions about your documents.",
        role: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
    }

    setPreviousVectorizedState(isCurrentlyVectorized);
  }, [indexDetails?.data?.vectorized, previousVectorizedState]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexId || !question) return;

    setQuestion("");
    const newMessage: Message = { content: question, role: "user" };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await askQuestionMutation.mutateAsync({
        indexId,
        question,
        activeFilesHashes: activeFiles,
      });

      if (response.status === "error") {
        const errorContent: Message = {
          content: "Index not vectorized. Embed the index to ask questions.",
          role: "error",
        };
        setMessages((prev) => [...prev, errorContent]);
        return;
      }

      const answerMessage: Message = {
        content: response.data.answer,
        role: "assistant",
      };
      setMessages((prev) => [...prev, answerMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorContent: Message = {
        content: "Something went wrong. Please try again.",
        role: "error",
      };
      setMessages((prev) => [...prev, errorContent]);
    }
  };

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === "error" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message.content}</AlertDescription>
                </Alert>
              ) : message.role === "system" ? (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    {message.content}
                  </AlertDescription>
                </Alert>
              ) : (
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-50 ml-auto w-3/4"
                      : "bg-gray-100 w-3/4"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </div>
          ))}
          {askQuestionMutation.isPending && (
            <div className="flex justify-center p-3">
              <div className="text-gray-500">Thinking...</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleAskQuestion} className="flex w-full gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            disabled={askQuestionMutation.isPending}
          />
          <Button type="submit" disabled={askQuestionMutation.isPending}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
