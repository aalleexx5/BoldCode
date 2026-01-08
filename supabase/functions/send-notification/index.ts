import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId, title, body, data }: NotificationRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    if (!fcmServerKey) {
      throw new Error("FCM_SERVER_KEY environment variable is not set");
    }

    const tokensResponse = await fetch(`${supabaseUrl}/rest/v1/fcm_tokens?user_id=eq.${userId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!tokensResponse.ok) {
      throw new Error('Failed to fetch FCM tokens');
    }

    const tokens = await tokensResponse.json();

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: "No FCM tokens found for user" }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const sendPromises = tokens.map(async (tokenDoc: { token: string }) => {
      const message = {
        to: tokenDoc.token,
        notification: {
          title,
          body,
        },
        data: data || {},
      };

      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `key=${fcmServerKey}`,
        },
        body: JSON.stringify(message),
      });

      return response.json();
    });

    const results = await Promise.all(sendPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications sent",
        results
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending notification:", error);

    return new Response(
      JSON.stringify({
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
