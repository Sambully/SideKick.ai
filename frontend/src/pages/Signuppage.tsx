import { SignUp } from "@clerk/clerk-react";
export const Signuppage = () => {
    return <div className='bg-slate-600 flex - justify-center h-screen'>
        <div className='flex scale-90 transform flex-col justify-center'>
          <SignUp appearance={{
            elements: {
              footer: "hidden",
              
            },
          }} routing='path' path="/sign-up" signInUrl='/sign-in' forceRedirectUrl='/Dashboard' />
        </div>
      </div>
}