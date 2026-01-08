"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileUpdateForm from "../components/profile-update-form";
import ChangeEmailForm from "../components/change-email-form";
import ChangePasswordForm from "../components/change-password-form";
import { User, Mail, Lock } from "lucide-react";
import EmailChangeCallbackBanner from "../components/email-change-callback-banner";


const triggerClass =
  "w-full justify-start rounded-lg gap-2 transition-all duration-200 " +
  "text-muted-foreground hover:text-foreground " +
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground " +
  "data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-primary/25";

const ProfileViews = () => {
  return (
    <section className="w-full max-w-5xl mx-auto p-3  md:p-6">
      <EmailChangeCallbackBanner />
    
   
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex items-start flex-col md:flex-row gap-6">
          {/* Left tabs */}
          <TabsList className="h-auto w-full md:w-64 flex flex-col items-stretch rounded-xl bg-muted p-2">
            <TabsTrigger value="profile" className={triggerClass}>
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>

            <TabsTrigger value="email" className={triggerClass}>
              <Mail className="h-4 w-4" />
             Change Email
            </TabsTrigger>

            <TabsTrigger value="password" className={triggerClass}>
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          {/* Right content */}
          <div className="flex-1 w-full">
            <TabsContent value="profile" className="m-0">
              <ProfileUpdateForm />
            </TabsContent>

            <TabsContent value="email" className="m-0">
              <ChangeEmailForm />
            </TabsContent>

            <TabsContent value="password" className="m-0">
              <ChangePasswordForm />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    
    </section>
  );
};

export default ProfileViews;
