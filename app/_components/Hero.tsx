"use client"
import { Button } from '@/components/ui/button'
import { SignIn, SignInButton, useUser } from '@clerk/nextjs'
import { Description } from '@radix-ui/react-dialog'
import axios from 'axios'
import { ArrowUp, HomeIcon, ImagePlus, Key, LayoutDashboard, Loader2 as Loader2Icon, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid';


const suggestions = [
  {
    label: "Dashboard",
    prompt: "Create an analytics dashboard to track customers and revenue data for a SaaS.",
    icon: LayoutDashboard,
  },
  {
    label: "SignUp Form",
    prompt: "Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox.",
    icon: Key,
  },
  {
    label: "Hero",
    prompt: "Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect, a short description, and a call-to-action button.",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt: "Create a modern user profile card component for a social media website.",
    icon: User
  }
]





function Hero() {

    const [userInput,setUserInput]=useState<string>();
    const {user} = useUser();
    const router = useRouter();
    const [loading,setLoading]=useState(false);


    const CreateNewProject = async() => {
      setLoading(true);
      const projectId = uuidv4();
      const frameId = generateRandomFrameNumber();
      const messages = [
        {
          role:'user',
          content:userInput
        }
      ]
      try{
        const result=await axios.post('/api/projects',{
          projectId:projectId,
          frameId:frameId,
          messages:messages
        });
        console.log(result.data);
        toast.success('Project created!')
        router.push(`/playground/${projectId}?frameId=${frameId}`)
        setLoading(false);
      }catch(e){
        toast.error('Internal Server Error!')
        console.log(e);
        setLoading(false);

      }
    }
  return (
    <div className='flex flex-col items-center h-[80vh] justify-center'>
        {/* Header & Description  */}
        <h2 className='font-bold text-6xl'>What should we design?</h2>
        <p className='mt-2 text-xl text-gray-500'>Generate, Edit and Explore design with AI, Export code as well</p>
        {/* input box  */}
        <div className='w-full max-w-2xl p-5 border mt-5 rounded-2xl'>
            <textarea placeholder='Describe your page design'
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)} 
                className='w-full h-24 focus:outline-none focus:ring-0 resize-none'
            />
            <div className='flex justify-between items-center'>
                <Button variant={'ghost'}><ImagePlus /></Button>
                
                {!user ? (
                    <SignInButton mode='modal' forceRedirectUrl={'/workspace'}>
                        <Button disabled={!userInput}><ArrowUp /></Button>
                    </SignInButton>
                ) : (
                    <Button 
                        disabled={!userInput || loading} 
                        onClick={CreateNewProject}>
                    
                    {loading?<Loader2Icon className='animate-spin'/> : <ArrowUp />}
                    </Button>
                )}
            </div>
        </div>
        {/* suggestion list  */}
        <div className='mt-4 flex gap-3'>
            {suggestions.map((suggestion, index ) => (
                <Button key={index} variant={'outline'}
                onClick={() =>setUserInput(suggestion.prompt)}
                >
                    <suggestion.icon/>
                    {suggestion.label}</Button>

            ))}
        </div>
    </div>
  )
}

export default Hero

const generateRandomFrameNumber=()=>{
  const num= Math.floor(Math.random()*10000);
  return num;
}
