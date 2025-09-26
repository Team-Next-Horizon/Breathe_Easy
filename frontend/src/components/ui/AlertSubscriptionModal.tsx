import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, MapPin } from 'lucide-react';

interface AlertSubscriptionModalProps {
  children: React.ReactNode;
}

const AlertSubscriptionModal: React.FC<AlertSubscriptionModalProps> = ({ children }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: '',
    threshold: 'moderate',
    emailNotifications: true,
    smsNotifications: true
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Alert subscription data:', formData);
    // You can add API call here to save the subscription
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Subscribe to Air Quality Alerts
          </DialogTitle>
          <DialogDescription>
            Get notified when air quality in your area reaches unhealthy levels. Stay informed and protect your health.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Mobile Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="City, State or ZIP code"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <Label htmlFor="threshold">Alert Threshold (AQI)</Label>
            <Select
              value={formData.threshold}
              onValueChange={(value) => handleInputChange('threshold', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderate">Moderate (51-100) - Orange</SelectItem>
                <SelectItem value="unhealthy-sensitive">Unhealthy for Sensitive (101+) - Orange</SelectItem>
                <SelectItem value="unhealthy">Unhealthy (151+) - Red</SelectItem>
                <SelectItem value="very-unhealthy">Very Unhealthy (201+) - Purple</SelectItem>
                <SelectItem value="hazardous">Hazardous (301+) - Maroon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Methods */}
          <div className="space-y-3">
            <Label>Notification Methods</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked as boolean)}
                />
                <Label htmlFor="email-notifications" className="text-sm font-normal">
                  Email notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms-notifications"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => handleInputChange('smsNotifications', checked as boolean)}
                />
                <Label htmlFor="sms-notifications" className="text-sm font-normal">
                  SMS notifications
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Subscribe to Alerts
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center">
            You can unsubscribe at any time. We respect your privacy.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertSubscriptionModal;