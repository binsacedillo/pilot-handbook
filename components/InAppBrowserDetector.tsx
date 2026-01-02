'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// Detect common in-app browsers
const detectInAppBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const inAppBrowserPatterns = [
    /FBAN|FBAV/i,        // Facebook
    /Instagram/i,         // Instagram
    /Messenger/i,         // Messenger
    /Line\//i,           // Line
    /Twitter/i,          // Twitter
    /MicroMessenger/i,   // WeChat
    /Snapchat/i,         // Snapchat
    /TikTok/i,           // TikTok
  ];
  
  return inAppBrowserPatterns.some(pattern => pattern.test(userAgent));
};

export function InAppBrowserDetector() {
  // Use lazy initializer to detect on mount without effect
  const [isInAppBrowser] = useState(detectInAppBrowser);

  if (!isInAppBrowser) return null;

  const openInBrowser = () => {
    // Get current URL
    const currentUrl = window.location.href;
    
    // Try to open in default browser
    // Note: This may not work in all in-app browsers
    window.location.href = currentUrl;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied! Please paste it in your browser.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Open in Browser</CardTitle>
          <CardDescription>
            For the best experience and to sign in, please open this page in your default browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In-app browsers (like the one in Messenger or Instagram) may have limited functionality.
          </p>
          <div className="space-y-2">
            <Button onClick={copyLink} className="w-full" variant="outline">
              Copy Link
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Then paste it in Safari, Chrome, or your preferred browser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
