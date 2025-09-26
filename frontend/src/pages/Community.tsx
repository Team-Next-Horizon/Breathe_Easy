import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MapPin,
  Heart,
  TrendingUp,
  MessageSquare,
  Share2,
  Award,
  Calendar,
  Building,
  School,
  Flag,
  Camera,
  BarChart3,
  Globe,
} from "lucide-react";

const Community = () => {
  const [newReport, setNewReport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const ambassadors = [
    {
      name: "Sarah Chen",
      role: "Air Quality Advocate",
      location: "San Francisco, CA",
      impact: "Helped 1,200+ residents",
      image: "/avatars/sarah.jpg",
      badge: "Gold Ambassador"
    },
    {
      name: "Miguel Rodriguez", 
      role: "Community Organizer",
      location: "Los Angeles, CA",
      impact: "Led 15 clean air campaigns",
      image: "/avatars/miguel.jpg",
      badge: "Environmental Hero"
    },
    {
      name: "Dr. Jennifer Park",
      role: "Public Health Expert", 
      location: "Seattle, WA",
      impact: "Educated 500+ families",
      image: "/avatars/jennifer.jpg",
      badge: "Health Champion"
    },
    {
      name: "Marcus Johnson",
      role: "Youth Coordinator",
      location: "Denver, CO", 
      impact: "Engaged 30+ schools",
      image: "/avatars/marcus.jpg",
      badge: "Future Leader"
    }
  ];

  const successStories = [
    {
      title: "Oakland Community Reduces PM2.5 by 23%",
      location: "Oakland, CA",
      date: "March 2024",
      description: "Local advocacy led to new industrial regulations and improved air quality monitoring in East Oakland.",
      participants: 847,
      outcome: "23% reduction in average PM2.5 levels"
    },
    {
      title: "Denver Schools Implement Air Quality Alerts", 
      location: "Denver, CO",
      date: "February 2024",
      description: "Parent coalition successfully lobbied for real-time air quality monitoring in all district schools.",
      participants: 1200,
      outcome: "30 schools now have automated alert systems"
    },
    {
      title: "Phoenix Heat Island Mitigation Project",
      location: "Phoenix, AZ", 
      date: "January 2024",
      description: "Community-driven tree planting and green infrastructure project improves local air quality.",
      participants: 650,
      outcome: "2°F average temperature reduction in target areas"
    }
  ];

  const reportedSources = [
    {
      type: "Industrial Emissions",
      location: "East Bay Area, CA",
      reports: 23,
      status: "Under Investigation",
      severity: "High"
    },
    {
      type: "Traffic Pollution",
      location: "I-405 Corridor, CA", 
      reports: 67,
      status: "Monitoring Active",
      severity: "Moderate"
    },
    {
      type: "Construction Dust",
      location: "Downtown Denver, CO",
      reports: 15,
      status: "Mitigation Implemented", 
      severity: "Low"
    }
  ];

  const equityData = [
    {
      area: "Environmental Justice Communities",
      avgAQI: 87,
      change: "+12%",
      population: "2.3M residents",
      trend: "improving"
    },
    {
      area: "Low-Income Areas",
      avgAQI: 94,
      change: "+8%", 
      population: "1.8M residents",
      trend: "stable"
    },
    {
      area: "High-Income Areas",
      avgAQI: 42,
      change: "-3%",
      population: "1.2M residents", 
      trend: "good"
    }
  ];

  const programs = [
    {
      type: "Schools",
      icon: School,
      title: "Clean Air Schools Initiative", 
      description: "Air quality monitoring and education programs in K-12 schools",
      participants: 156,
      coverage: "12 school districts"
    },
    {
      type: "Workplace",
      icon: Building,
      title: "Healthy Workplace Certification",
      description: "Helping businesses implement air quality best practices", 
      participants: 89,
      coverage: "Corporate partners"
    },
    {
      type: "Community",
      icon: Users,
      title: "Citizen Science Network",
      description: "Training residents to collect and report air quality data",
      participants: 1240,
      coverage: "Active volunteers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Community Impact Hub
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Building Healthier Communities Together</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with local advocates, share your impact stories, and drive positive change 
            for cleaner air in your community.
          </p>
        </div>

        <Tabs defaultValue="ambassadors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ambassadors">Ambassadors</TabsTrigger>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
            <TabsTrigger value="reporting">Source Reporting</TabsTrigger>
            <TabsTrigger value="equity">Environmental Justice</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          {/* Community Ambassadors */}
          <TabsContent value="ambassadors" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Air Quality Ambassadors</h2>
              <p className="text-muted-foreground">
                Local champions leading the fight for cleaner air in their communities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ambassadors.map((ambassador, index) => (
                <Card key={index} className="nasa-card text-center">
                  <CardHeader>
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={ambassador.image} alt={ambassador.name} />
                      <AvatarFallback>{ambassador.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{ambassador.name}</CardTitle>
                    <CardDescription>{ambassador.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {ambassador.location}
                    </div>
                    <Badge variant="outline" className="mb-2">{ambassador.badge}</Badge>
                    <p className="text-sm font-medium text-primary">{ambassador.impact}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card bg-gradient-nasa text-white">
              <CardContent className="p-8 text-center space-y-4">
                <Award className="h-12 w-12 mx-auto opacity-90" />
                <h3 className="text-2xl font-bold">Become an Ambassador</h3>
                <p className="text-lg opacity-90">
                  Join our network of community leaders making a difference in air quality advocacy
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90">
                    Apply Now
                  </Button>
                  <Button size="lg" variant="default" className="bg-accent text-white hover:bg-accent/90 border-0">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Success Stories */}
          <TabsContent value="stories" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Community Success Stories</h2>
              <p className="text-muted-foreground">
                Real impact from communities taking action for cleaner air
              </p>
            </div>

            <div className="space-y-6">
              {successStories.map((story, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2 lg:space-y-0">
                      <div>
                        <CardTitle className="text-xl">{story.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {story.location} • {story.date}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {story.participants} participants
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{story.description}</p>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-data-accent" />
                        Impact Achieved
                      </h4>
                      <p className="text-sm text-muted-foreground">{story.outcome}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Story
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn Methods
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card border-dashed border-2">
              <CardContent className="p-8 text-center space-y-4">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-bold text-foreground">Share Your Story</h3>
                <p className="text-muted-foreground">
                  Have a success story about improving air quality in your community? We'd love to feature it!
                </p>
                <Button>
                  Submit Your Story
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Source Reporting */}
          <TabsContent value="reporting" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Community Pollution Reporting</h2>
              <p className="text-muted-foreground">
                Help identify and track pollution sources in your area
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flag className="h-5 w-5 mr-2" />
                    Report a Pollution Source
                  </CardTitle>
                  <CardDescription>
                    Help us track and address pollution sources in your community
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      placeholder="Enter address or landmark"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pollution Type</label>
                    <select className="w-full p-2 border border-border rounded-md">
                      <option>Industrial Emissions</option>
                      <option>Vehicle Exhaust</option>
                      <option>Construction Dust</option>
                      <option>Burning/Smoke</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Describe what you observed..."
                      value={newReport}
                      onChange={(e) => setNewReport(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button className="w-full">
                    Submit Report
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle>Active Reports</CardTitle>
                    <CardDescription>Community-reported pollution sources being tracked</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reportedSources.map((source, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{source.type}</h4>
                            <p className="text-xs text-muted-foreground">{source.location}</p>
                          </div>
                          <Badge variant={source.severity === "High" ? "destructive" : source.severity === "Moderate" ? "default" : "outline"}>
                            {source.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{source.reports} reports</span>
                          <span className="font-medium">{source.status}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle>Reporting Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Include specific location details</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Note time and weather conditions</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Provide photos if possible</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>Report recurring issues</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Environmental Justice */}
          <TabsContent value="equity" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Environmental Justice & Equity</h2>
              <p className="text-muted-foreground">
                Tracking air quality disparities and working toward environmental equity
              </p>
            </div>

            <Card className="nasa-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Air Quality Equity Data
                </CardTitle>
                <CardDescription>
                  Comparing air quality across different community demographics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equityData.map((data, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{data.area}</h4>
                        <Badge variant={data.trend === "good" ? "default" : data.trend === "improving" ? "secondary" : "outline"}>
                          {data.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg AQI:</span>
                          <span className="ml-2 font-bold text-lg">{data.avgAQI}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Change:</span>
                          <span className="ml-2 font-medium">{data.change}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Population:</span>
                          <span className="ml-2 font-medium">{data.population}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Policy Impact Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New regulations passed:</span>
                      <span className="font-medium">12 this year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Communities benefited:</span>
                      <span className="font-medium">847,000 residents</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average improvement:</span>
                      <span className="font-medium">15% AQI reduction</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    View Policy Tracker
                  </Button>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Advocacy Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Resources to help advocate for environmental justice in your community
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Contact Representatives
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Community Data Reports
                    </Button>
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Organize Local Action
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Programs */}
          <TabsContent value="programs" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Community Programs</h2>
              <p className="text-muted-foreground">
                Initiatives bringing air quality awareness to schools, workplaces, and communities
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {programs.map((program, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <program.icon className="h-8 w-8 mb-4 text-primary" />
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{program.participants}</div>
                        <div className="text-xs text-muted-foreground">{program.coverage}</div>
                      </div>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          Learn More
                        </Button>
                        <Button size="sm" className="w-full">
                          Join Program
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Clean Air Action Day</h4>
                    <p className="text-sm text-muted-foreground">April 15, 2025 • Virtual & Local Events</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Community Air Monitoring Workshop</h4>
                    <p className="text-sm text-muted-foreground">April 22, 2025 • San Francisco, CA</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <h4 className="font-medium">Environmental Justice Summit</h4>
                    <p className="text-sm text-muted-foreground">May 3, 2025 • Los Angeles, CA</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;