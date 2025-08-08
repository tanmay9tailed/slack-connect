import React from 'react';

import PixelatedBox from '../components/common/PixelatedBox';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-32 px-4 sm:px-6">
      <div className="container mx-auto flex flex-col items-center text-center">
        <PixelatedBox className="p-6 sm:p-8 md:p-12 bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black mb-4">
            Easily schedule messages to Slack.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-800 max-w-3xl">
            Message directly to any channel and connect to your desired workspace. Automate your workflow, one message at a time.
          </p>
        </PixelatedBox>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 mt-10 md:mt-12 w-full max-w-5xl">
          <PixelatedBox className="p-6 bg-gradient-to-br from-purple-200 to-indigo-300">
            <h3 className="font-bold text-xl mb-2">Connect Workspace</h3>
            <p>Link your Slack workspace in seconds with our secure connection.</p>
          </PixelatedBox>
          <PixelatedBox className="p-6 bg-gradient-to-br from-green-200 to-emerald-300">
            <h3 className="font-bold text-xl mb-2">Schedule Easily</h3>
            <p>Pick a date, time, and channel. Write your message. That's it!</p>
          </PixelatedBox>
          <PixelatedBox className="p-6 bg-gradient-to-br from-blue-200 to-sky-300">
            <h3 className="font-bold text-xl mb-2">Direct Messaging</h3>
            <p>Send scheduled messages to public channels, private channels, or DMs.</p>
          </PixelatedBox>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
