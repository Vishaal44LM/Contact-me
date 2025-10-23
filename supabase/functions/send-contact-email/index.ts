import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  fullName: string;
  email: string;
  subject?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, subject, message }: ContactRequest = await req.json();

    console.log("Processing contact form submission from:", email);

    // Validate input
    if (!fullName || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (message.length < 20) {
      return new Response(
        JSON.stringify({ error: "Message must be at least 20 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store in database
    const { error: dbError } = await supabase.from("contacts").insert({
      full_name: fullName,
      email: email,
      subject: subject || null,
      message: message,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store contact message");
    }

    console.log("Contact message stored in database");

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["veeeeshaaaal@gmail.com"],
      subject: subject ? `New Contact: ${subject}` : "New Contact Form Submission",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4f46e5; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This message was sent via your website's contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted and email sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process contact form" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
