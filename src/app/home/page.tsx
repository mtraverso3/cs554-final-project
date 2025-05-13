"use server";
import { auth0 } from "@/lib/auth/auth";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb, BookOpen, Award } from "lucide-react";

export default async function HomePage() {
  const session = await auth0.getSession();

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9F5]">
      <Navbar />
      <section className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-20 bg-gradient-to-b from-[#FFF9F5] to-[#FFF0E5]">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="absolute top-40 left-20 w-20 h-20 rounded-full bg-[#FFE0CC] opacity-40 animate-pulse"></div>
          <div className="absolute top-60 right-40 w-12 h-12 rounded-full bg-[#FFCAB0] opacity-40 animate-pulse"></div>
          <div className="absolute bottom-40 left-40 w-16 h-16 rounded-full bg-[#FFD4BC] opacity-40 animate-pulse"></div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B35] to-[#FF9E64]">
            Learning Made Fun & Effective!
          </h1>
          <p className="text-xl text-[#6B5B54] max-w-3xl mx-auto mb-8">
            Boost your knowledge with our friendly flashcards and interactive quizzes designed to make studying enjoyable
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!session ? (
              <>
                <Button 
                  size="lg" 
                  asChild 
                  className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#FF8C5A] text-white rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <a href="/auth/login?screen_hint=signup">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild 
                  className="w-full sm:w-auto rounded-full border-[#FF6B35] text-[#FF6B35] hover:bg-[#FFF0E5] transition-all transform hover:-translate-y-1"
                >
                  <a href="/auth/login">Sign In</a>
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#FF8C5A] text-white rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <Link href="/user/home">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FFE0CC] transition-all hover:shadow-lg hover:scale-105 hover:border-[#FFCAB0]">
              <div className="bg-[#FFF0E5] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-4 border-[#FFEBDD]">
                <Lightbulb className="h-10 w-10 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#FF6B35]">Flashcards</h3>
              <p className="text-[#6B5B54]">
                Create playful flashcard decks to reinforce your learning and make studying a delightful experience
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FFE0CC] transition-all hover:shadow-lg hover:scale-105 hover:border-[#FFCAB0]">
              <div className="bg-[#FFF0E5] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-4 border-[#FFEBDD]">
                <BookOpen className="h-10 w-10 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#FF6B35]">Quizzes</h3>
              <p className="text-[#6B5B54]">
                Enjoy interactive quizzes with fun challenges that make mastering new topics engaging and satisfying
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FFE0CC] transition-all hover:shadow-lg hover:scale-105 hover:border-[#FFCAB0]">
              <div className="bg-[#FFF0E5] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-4 border-[#FFEBDD]">
                <Award className="h-10 w-10 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#FF6B35]">Progress Tracking</h3>
              <p className="text-[#6B5B54]">
                Watch your knowledge grow with progress tracking that celebrates your learning achievements
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-[#FFF0E5]">
          <path d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4 text-center text-[#6B5B54] text-sm">
          <p>© 2025 CS554 Final Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
