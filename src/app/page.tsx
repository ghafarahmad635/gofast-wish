'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client.ts";
import { useState } from "react";


export default function Home() {
  const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
const onSubmit=()=>{
  authClient.signUp.email({
    email:email,
    name:name,
    password:password
  },{
    onError:(ctx)=>{
      alert("Error")
    },
    onSuccess:(ctx)=>{
      alert("Success")
    },
     onRequest: (ctx) => {
      alert("onRequest")
     }
  })
}

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>
        <Input
          placeholder="Name"
          value={name}
          type="text"
          onChange={(e) => setName(e.target.value)} // ✅ correct
        />
        <Input
          placeholder="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)} // ✅ correct
        />
         <Input
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)} // ✅ correct
        />
      </div>

      <Button onClick={onSubmit}>
        create User
      </Button>
    </div>
  );
}
