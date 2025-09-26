import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  Satellite, 
  Shield, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Wind,
  Eye,
  Activity
} from "lucide-react";
import earthImage from "@/assets/earth-from-space.jpg";

const HomePage = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState("San Francisco, CA");
  const [isLocating, setIsLocating] = useState(false);

  const handleUseMyLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || "Unknown Location";
          const state = data.principalSubdivision || "";
          const locationString = state ? `${city}, ${state}` : city;
          
          setCurrentLocation(locationString);
          setSearchLocation(locationString);
        } catch (error) {
          console.error("Error getting location name:", error);
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setSearchLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        alert(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const stats = [
    { label: "Cities Monitored", value: "2,847", icon: MapPin, color: "text-data-primary" },
    { label: "TEMPO Data Points", value: "1.2M+", icon: Satellite, color: "text-data-secondary" },
    { label: "Health Alerts Sent", value: "45,203", icon: Shield, color: "text-data-accent" },
    { label: "Active Communities", value: "1,156", icon: Users, color: "text-primary" },
  ];

  const airQualityLevels = [
    { level: "Good", range: "0-50", color: "air-quality-good", description: "Air quality is satisfactory" },
    { level: "Moderate", range: "51-100", color: "air-quality-moderate", description: "Acceptable for most people" },
    { level: "Unhealthy", range: "101-150", color: "air-quality-unhealthy", description: "Sensitive groups may experience symptoms" },
  ];

  const features = [
    {
      icon: Eye,
      title: "Real-Time Monitoring",
      description: "Live air quality data from NASA's TEMPO satellite, updated every hour with precision atmospheric measurements."
    },
    {
      icon: TrendingUp,
      title: "Predictive Forecasting",
      description: "48-hour air quality forecasts using advanced machine learning models and meteorological data integration."
    },
    {
      icon: AlertTriangle,
      title: "Health Alerts",
      description: "Personalized notifications for sensitive groups, with recommendations for outdoor activities and health protection."
    },
    {
      icon: Activity,
      title: "Community Impact",
      description: "Track local air quality trends, connect with environmental advocates, and drive positive change in your area."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${earthImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-primary text-primary">
              <Satellite className="h-4 w-4 mr-2" />
              Powered by NASA TEMPO Satellite Data
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Clean Air Intelligence for
              <span className="bg-gradient-nasa bg-clip-text text-transparent"> Healthier Communities</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time air quality monitoring and forecasting using NASA's TEMPO satellite data. 
              Protect your health, plan your activities, and join the movement for cleaner skies.
            </p>

            {/* Location Search */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Enter city or zip code"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button size="lg" className="px-8">
                  <MapPin className="h-4 w-4 mr-2" />
                  Check Now
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm" 
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isLocating ? "Getting location..." : "Use my location"}
              </Button>
            </div>

            {/* Current AQI Display */}
            <div className="nasa-card max-w-sm mx-auto p-6 animate-scale-in">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Current AQI - {currentLocation}</p>
                <div className="text-3xl font-bold text-air-good">42</div>
                <Badge className="air-quality-good">Good</Badge>
                <p className="text-xs text-muted-foreground">Last updated: 2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center nasa-card">
                <CardContent className="pt-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-2">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Advanced Air Quality Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leveraging NASA's cutting-edge TEMPO satellite technology to provide unprecedented 
              insights into atmospheric conditions across North America.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="nasa-card group">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-nasa mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Air Quality Guide */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                Understanding Air Quality
              </h2>
              <p className="text-xl text-muted-foreground">
                Learn how to interpret air quality data and protect your health
              </p>
            </div>

            <div className="space-y-4">
              {airQualityLevels.map((level, index) => (
                <Card key={index} className="nasa-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={level.color}>{level.level}</Badge>
                        <div>
                          <h3 className="font-semibold text-foreground">AQI {level.range}</h3>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                      <Wind className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/health">
                <Button size="lg" variant="outline">
                  Learn More About Health Impact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="nasa-card bg-gradient-nasa text-white">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Breathe Easier?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of communities using AirVision TEMPO to make informed decisions 
                about their health and environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" variant="default" className="min-w-[200px] bg-white text-primary hover:bg-white/90">
                    View Dashboard
                  </Button>
                </Link>
                <Link to="/community">
                  <Button size="lg" variant="default" className="min-w-[200px] bg-accent text-white hover:bg-accent/90 border-0">
                    Join Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;