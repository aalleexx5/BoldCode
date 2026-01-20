import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  requestNumber: string;
  requestTitle: string;
  dueDate?: string;
  assignedUserName: string;
}

async function sendEmail(emailData: EmailRequest): Promise<boolean> {
  const smtpClient = new SMTPClient({
    connection: {
      hostname: "boldcodeco.com",
      port: 465,
      tls: true,
      auth: {
        username: "trackingwebapp@boldcodeco.com",
        password: "Spawn1379!",
      },
    },
  });

  const emailBody = `
Hello ${emailData.assignedUserName},

You have been assigned to a new request:

Request #${emailData.requestNumber}
Title: ${emailData.requestTitle}
${emailData.dueDate ? `Due Date: ${new Date(emailData.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}

Please log in to the tracking system to view more details.

Best regards,
Bold Code Co. Tracking System
  `.trim();

  try {
    await smtpClient.send({
      from: "Bold Code Co. Tracking <trackingwebapp@boldcodeco.com>",
      to: emailData.to,
      subject: `New Request Assignment - #${emailData.requestNumber}`,
      content: emailBody,
    });

    await smtpClient.close();
    return true;
  } catch (error) {
    console.error("SMTP Error:", error);
    try {
      await smtpClient.close();
    } catch {}
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailData: EmailRequest = await req.json();

    if (!emailData.to || !emailData.requestNumber || !emailData.requestTitle) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: to, requestNumber, requestTitle"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const success = await sendEmail(emailData);

    return new Response(
      JSON.stringify({
        success,
        message: success ? "Email sent successfully" : "Failed to send email"
      }),
      {
        status: success ? 200 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
