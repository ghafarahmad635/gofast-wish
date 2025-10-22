'use client';

import { motion } from 'framer-motion';
import { User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { createAuthClient } from 'better-auth/react';

const { useSession } = createAuthClient();

const DashboardHeader = () => {
  const {
    data: session,
    isPending,
    error,
  } = useSession();

  if (isPending) {
    return (
      <div className="py-6 px-4 md:px-8">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-white" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white rounded" />
            <div className="h-4 w-56 bg-white rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session?.user) {
    return (
      <div className="py-6 px-4 md:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error ? 'Failed to load session.' : 'You are not signed in.'}
        </div>
      </div>
    );
  }

  const user = session.user;
  const firstName = user.name?.split(' ')[0] || 'User';

  return (
    <div className="py-6 px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'Avatar'}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover shadow-lg"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
            <UserIcon size={28} />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Great to see you again — let’s get some progress today.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHeader;
