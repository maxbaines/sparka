import { CheckCircle, XCircle, Send } from 'lucide-react';

interface InstagramSendMessageProps {
  result: {
    success: boolean;
    message: string;
    direct_message_id?: string;
  };
  args: {
    username: string;
    message: string;
  };
}

export function InstagramSendMessage({
  result,
  args,
}: InstagramSendMessageProps) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Message to @{args.username}</span>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            "{args.message}"
          </div>
        </div>
      </div>
    </div>
  );
}
