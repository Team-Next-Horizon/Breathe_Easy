import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Shield,
  AlertTriangle,
  Calendar,
  Download,
  Bell,
  Users,
  Activity,
  Wind,
  Stethoscope,
  FileText,
  Phone,
} from "lucide-react";

const HealthCenter = () => {
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState("");
  const [showRiskResult, setShowRiskResult] = useState(false);

  const healthRecommendations = [
    {
      aqi: "0-50",
      level: "Good",
      color: "air-quality-good",
      outdoor: "Excellent day for outdoor activities",
      exercise: "All outdoor exercise recommended",
      sensitive: "Ideal air quality for everyone",
      windows: "Perfect time to open windows"
    },
    {
      aqi: "51-100", 
      level: "Moderate",
      color: "air-quality-moderate",
      outdoor: "Generally acceptable for outdoor activities",
      exercise: "Outdoor exercise acceptable for most people",
      sensitive: "Unusually sensitive people should consider limiting prolonged outdoor exertion",
      windows: "Acceptable to open windows"
    },
    {
      aqi: "101-150",
      level: "Unhealthy for Sensitive Groups",
      color: "air-quality-unhealthy",
      outdoor: "Sensitive groups should limit outdoor activities",
      exercise: "Sensitive individuals should avoid outdoor exercise",
      sensitive: "Children, elderly, and people with heart/lung conditions should stay indoors",
      windows: "Keep windows closed, use air purifier if available"
    }
  ];

  const sensitiveGroups = [
    {
      group: "Children & Teens",
      icon: Users,
      description: "Developing lungs are more vulnerable to air pollution",
      recommendations: [
        "Limit outdoor sports during high pollution days",
        "Monitor symptoms like coughing or difficulty breathing",
        "Keep rescue inhalers available for asthmatic children"
      ]
    },
    {
      group: "Adults 65+",
      icon: Heart,
      description: "Age-related health conditions increase sensitivity",
      recommendations: [
        "Avoid outdoor exercise when AQI exceeds 100",
        "Consider indoor alternatives for physical activity",
        "Monitor cardiovascular symptoms closely"
      ]
    },
    {
      group: "Asthma & Respiratory",
      icon: Activity,
      description: "Pre-existing conditions worsen with poor air quality",
      recommendations: [
        "Always carry rescue medications when outdoors",
        "Check air quality before leaving home",
        "Use HEPA air purifiers indoors"
      ]
    },
    {
      group: "Heart Disease",
      icon: Stethoscope,
      description: "Air pollution can trigger cardiovascular events",
      recommendations: [
        "Monitor blood pressure during high pollution",
        "Avoid strenuous outdoor activities",
        "Consult physician about air quality concerns"
      ]
    }
  ];

  const emergencyActions = [
    {
      severity: "Moderate Health Alert",
      aqi: "101-200",
      actions: [
        "Sensitive groups stay indoors",
        "Close windows and use air purifiers", 
        "Limit outdoor activities to essential only",
        "Monitor local health advisories"
      ]
    },
    {
      severity: "Health Emergency",
      aqi: "201+",
      actions: [
        "Everyone should stay indoors",
        "Avoid all outdoor physical activities",
        "Seek medical attention for breathing difficulties",
        "Follow official emergency guidelines"
      ]
    }
  ];

  const handleRiskFactorChange = (factor: string, checked: boolean) => {
    if (checked) {
      setRiskFactors([...riskFactors, factor]);
    } else {
      setRiskFactors(riskFactors.filter(f => f !== factor));
    }
  };

  const calculateRisk = () => {
    setShowRiskResult(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-4 py-2">
            <Heart className="h-4 w-4 mr-2" />
            Health & Safety Center
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">Personalized Health Protection</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized health recommendations, risk assessments, and emergency guidance 
            based on real-time air quality conditions in your area.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Risk Calculator</TabsTrigger>
            <TabsTrigger value="recommendations">Daily Guidance</TabsTrigger>
            <TabsTrigger value="groups">Sensitive Groups</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Plans</TabsTrigger>
          </TabsList>

          {/* Risk Calculator */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Personal Health Risk Assessment
                  </CardTitle>
                  <CardDescription>
                    Calculate your personalized air quality health risk
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Age Group</Label>
                      <RadioGroup value={ageGroup} onValueChange={setAgeGroup} className="mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="child" id="child" />
                          <Label htmlFor="child">Under 18</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="adult" id="adult" />
                          <Label htmlFor="adult">18-64</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="senior" id="senior" />
                          <Label htmlFor="senior">65+</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Health Conditions (select all that apply)</Label>
                      <div className="mt-2 space-y-2">
                        {["Asthma", "Heart Disease", "COPD", "Diabetes", "Pregnancy"].map((condition) => (
                          <div key={condition} className="flex items-center space-x-2">
                            <Checkbox 
                              id={condition}
                              checked={riskFactors.includes(condition)}
                              onCheckedChange={(checked) => handleRiskFactorChange(condition, checked as boolean)}
                            />
                            <Label htmlFor={condition}>{condition}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Your Location</Label>
                      <Input id="location" placeholder="Enter city or zip code" />
                    </div>

                    <Button onClick={calculateRisk} className="w-full" size="lg">
                      Calculate My Risk Level
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {showRiskResult && (
                  <Card className="nasa-card border-l-4 border-l-air-moderate">
                    <CardHeader>
                      <CardTitle className="text-lg">Your Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Badge className="air-quality-moderate text-lg px-4 py-2">Moderate Risk</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on current air quality: AQI 87 in your area
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Personalized Recommendations:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Limit outdoor exercise to 30 minutes</li>
                          <li>• Consider indoor activities for cardio workouts</li>
                          <li>• Keep windows closed during peak pollution hours</li>
                          <li>• Monitor symptoms if you have asthma</li>
                        </ul>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <Bell className="h-4 w-4 mr-2" />
                        Subscribe to Health Alerts
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card className="nasa-card">
                  <CardHeader>
                    <CardTitle>Current Air Quality</CardTitle>
                    <CardDescription>Your location: San Francisco, CA</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-4xl font-bold text-air-moderate">87</div>
                    <Badge className="air-quality-moderate">Moderate</Badge>
                    <p className="text-sm text-muted-foreground">
                      Acceptable for most people. Sensitive individuals should consider limiting prolonged outdoor exertion.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <div className="text-sm font-medium">PM2.5</div>
                        <div className="text-xs text-muted-foreground">23 μg/m³</div>
                      </div>
                      <div className="p-2 rounded bg-muted/30 text-center">
                        <div className="text-sm font-medium">Ozone</div>
                        <div className="text-xs text-muted-foreground">0.065 ppm</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Daily Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Daily Activity Recommendations</h2>
              <p className="text-muted-foreground">
                Health guidance based on current and forecasted air quality levels
              </p>
            </div>

            <div className="space-y-6">
              {healthRecommendations.map((rec, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          AQI {rec.aqi} - {rec.level}
                        </CardTitle>
                      </div>
                      <Badge className={rec.color}>{rec.level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Wind className="h-4 w-4 mr-2" />
                          Outdoor Activities
                        </h4>
                        <p className="text-sm text-muted-foreground">{rec.outdoor}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Exercise
                        </h4>
                        <p className="text-sm text-muted-foreground">{rec.exercise}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Sensitive Groups
                        </h4>
                        <p className="text-sm text-muted-foreground">{rec.sensitive}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Indoor Air
                        </h4>
                        <p className="text-sm text-muted-foreground">{rec.windows}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sensitive Groups */}
          <TabsContent value="groups" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Guidance for Sensitive Groups</h2>
              <p className="text-muted-foreground">
                Specific recommendations for those at higher risk from air pollution
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sensitiveGroups.map((group, index) => (
                <Card key={index} className="nasa-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <group.icon className="h-5 w-5 mr-2" />
                      {group.group}
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Key Recommendations:</h4>
                      <ul className="space-y-2">
                        {group.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="nasa-card bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Healthcare Provider Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tools and resources for healthcare professionals to help patients manage air quality-related health risks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Printable Reports
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Patient Guidelines
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Professional Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Plans */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Emergency Action Plans</h2>
              <p className="text-muted-foreground">
                Immediate actions to take during severe air quality events
              </p>
            </div>

            <div className="space-y-6">
              {emergencyActions.map((emergency, index) => (
                <Card key={index} className="nasa-card border-l-4 border-l-destructive">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                      {emergency.severity}
                    </CardTitle>
                    <CardDescription>AQI {emergency.aqi}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Immediate Actions:</h4>
                      <ul className="space-y-2">
                        {emergency.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm flex items-start">
                            <span className="w-2 h-2 rounded-full bg-destructive mt-2 mr-2 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Poison Control:</span>
                      <span className="font-medium">1-800-222-1222</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Services:</span>
                      <span className="font-medium">911</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Health Dept:</span>
                      <span className="font-medium">(555) 123-4567</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Emergency Plan
                  </Button>
                </CardContent>
              </Card>

              <Card className="nasa-card">
                <CardHeader>
                  <CardTitle>Preparation Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="supplies" />
                      <Label htmlFor="supplies">Emergency medical supplies ready</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="purifier" />
                      <Label htmlFor="purifier">Air purifier accessible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="masks" />
                      <Label htmlFor="masks">N95 masks available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="plan" />
                      <Label htmlFor="plan">Family emergency plan reviewed</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthCenter;