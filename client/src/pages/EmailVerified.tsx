import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function EmailVerified() {
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const successParam = params.get('success');
    setIsSuccess(successParam === 'true');
  }, [location]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess === true && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium mb-4">Verification Successful!</p>
              <p className="text-muted-foreground mb-6">
                Your email has been verified. You can now log in to your account.
              </p>
              <Link to="/login" className="text-reddit-blue hover:underline">
                Go to Login
              </Link>
            </div>
          )}
          {isSuccess === false && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-lg font-medium mb-4">Verification Failed</p>
              <p className="text-muted-foreground">
                The verification link is invalid or has expired. Please try registering again.
              </p>
            </div>
          )}
          {isSuccess === null && (
            <p className="text-muted-foreground">Verifying...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}