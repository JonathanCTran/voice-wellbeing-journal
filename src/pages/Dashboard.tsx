
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useJournal } from "../contexts/JournalContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import MoodEntryList from "@/components/MoodEntryList";
import { Mic } from "lucide-react";
import SentimentBadge from "@/components/SentimentBadge";

const Dashboard = () => {
  const { authState, logout } = useAuth();
  const { entries } = useJournal();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  // Prepare data for chart - we want chronological order for the chart
  const getChartData = () => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return sortedEntries.map(entry => ({
      date: format(new Date(entry.createdAt), 'MM/dd'),
      sentiment: entry.sentiment.score,
      type: entry.sentiment.label,
    }));
  };
  
  const chartData = getChartData();
  
  // Calculate average sentiment
  const averageSentiment = entries.length > 0 
    ? entries.reduce((acc, entry) => acc + entry.sentiment.score, 0) / entries.length
    : 0;
  
  // Determine mood status
  let moodStatus = "Neutral";
  let moodColor = "bg-gray-200";
  
  if (averageSentiment > 0.3) {
    moodStatus = "Positive";
    moodColor = "bg-mood-green";
  } else if (averageSentiment < -0.3) {
    moodStatus = "Negative";
    moodColor = "bg-mood-red";
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewEntry = () => {
    navigate("/record");
  };

  // For display we use the 5 most recent entries - get them in chronological order
  const recentEntries = [...entries]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-mood-blue rounded-full p-2 mr-3">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-mood-blue">Mood Journal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium hidden sm:block">
              Hi, {authState.user?.name || "User"}
            </p>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="space-y-8 pb-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-full md:col-span-2 bg-white/90 backdrop-blur shadow-sm animate-fade-in-up">
              <CardContent className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-lg font-medium">Mood Trend</h2>
                  <div className="flex space-x-2">
                    <Button
                      variant={selectedPeriod === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod("week")}
                      className={selectedPeriod === "week" ? "bg-mood-blue" : ""}
                    >
                      Week
                    </Button>
                    <Button
                      variant={selectedPeriod === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod("month")}
                      className={selectedPeriod === "month" ? "bg-mood-blue" : ""}
                    >
                      Month
                    </Button>
                  </div>
                </div>
                
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4A90E2" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis 
                        domain={[-1, 1]} 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => value.toFixed(1)}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          return [`Sentiment: ${Number(value).toFixed(2)}`, ''];
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#4A90E2"
                        fillOpacity={1}
                        fill="url(#colorSentiment)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur shadow-sm flex items-center justify-center p-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-center">
                <h2 className="text-lg font-medium mb-2">Current Mood</h2>
                <div className="flex justify-center mb-2">
                  <SentimentBadge sentiment={{ score: averageSentiment, magnitude: 0.5, label: moodStatus.toLowerCase() as any }} size="lg" />
                </div>
                <p className="text-sm text-gray-500">
                  Based on your recent entries
                </p>
              </div>
            </Card>
          </section>

          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Entries</h2>
              <Button 
                onClick={handleNewEntry}
                className="bg-mood-blue hover:bg-mood-blue/90"
              >
                <Mic className="mr-2 h-4 w-4" /> New Entry
              </Button>
            </div>
            
            <MoodEntryList entries={recentEntries} />
            
            {entries.length === 0 && (
              <Card className="bg-white/90 backdrop-blur p-8 text-center">
                <p className="text-gray-500">No journal entries yet. Create your first one!</p>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
