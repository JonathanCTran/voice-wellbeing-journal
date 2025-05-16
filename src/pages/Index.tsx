
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, BarChart, Brain, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <div className="bg-mood-blue rounded-full p-2 mr-3">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-mood-blue">Mood Journal</h1>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-mood-blue hover:bg-mood-blue/90"
          >
            Get Started
          </Button>
        </header>

        <main>
          <section className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
              Track Your Emotions with <span className="text-mood-blue">Voice</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Record your thoughts and feelings through voice notes. 
              Our AI analyzes your emotions to help you understand your 
              mental wellbeing over time.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="bg-mood-blue hover:bg-mood-blue/90 text-lg"
            >
              Start Journaling <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/90 backdrop-blur rounded-lg p-8 shadow-sm transition-transform hover:-translate-y-1 animate-fade-in-up">
              <div className="bg-mood-lightBlue rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-mood-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Voice Recording</h3>
              <p className="text-gray-600">
                Easily record your thoughts and feelings with our intuitive voice recorder.
                Express yourself naturally without typing.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur rounded-lg p-8 shadow-sm transition-transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="bg-mood-lightBlue rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-mood-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sentiment Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your journal entries to detect emotions and sentiments,
                giving you insights into your emotional state.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur rounded-lg p-8 shadow-sm transition-transform hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-mood-lightBlue rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-mood-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mood Tracking</h3>
              <p className="text-gray-600">
                Visualize your emotional patterns over time with our beautiful charts
                and gain valuable insights about your mental wellbeing.
              </p>
            </div>
          </section>

          <section className="bg-white/90 backdrop-blur rounded-lg p-8 shadow-sm text-center max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Journaling Practice?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of people who use voice journaling to improve self-awareness
              and emotional wellbeing.
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-mood-blue hover:bg-mood-blue/90"
            >
              Sign Up Now
            </Button>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Mood Journal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
