import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ContactUs() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.message.length < 20) {
      toast({
        title: "Message too short",
        description: "Please write at least 20 characters in your message.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          subject: formData.subject?.trim() || null,
          message: formData.message.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to invoke email function");
      }

      if (data && typeof data === "object" && "error" in data && (data as any).error) {
        throw new Error((data as any).error);
      }

      toast({
        title: "✅ Your message was sent successfully!",
        description: "I will get back to you as soon as possible.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "❌ Failed to send your message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen py-16 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-2xl mx-auto">
        <Card className="shadow-2xl border-2 animate-fade-in hover-scale backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Contact Me
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Have a question? Love to hear from you. Send me a message and I will respond as soon as possible.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                <Textarea
                  id="message"
                  required
                  minLength={20}
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isLoading}
                  className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.message.length}/20 characters minimum
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-border/50 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="h-1 w-8 bg-primary rounded-full"></span>
                Get in Touch
              </h3>
              <div className="space-y-3">
                <a 
                  href="mailto:veeeeshaaaal@gmail.com" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 p-3 rounded-lg hover:bg-muted/50 group"
                >
                  <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">veeeeshaaaal@gmail.com</span>
                </a>
                <a 
                  href="tel:7305260551" 
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all duration-300 p-3 rounded-lg hover:bg-muted/50 group"
                >
                  <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">7305260551</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
