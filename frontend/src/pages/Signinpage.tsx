import { SignIn } from "@clerk/clerk-react";
export function Signinpage() {
    return <div className='bg-slate-600 flex - justify-center h-screen'>
        <div className='flex  flex-col justify-center'>
          <SignIn appearance={{
            elements: {
              footer: "hidden" 
            }
          }} routing='path' path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/Dashboard"/>
        </div>
      </div>
}