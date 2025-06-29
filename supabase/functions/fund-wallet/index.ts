const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface FundRequest {
  address: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { address }: FundRequest = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Validate Algorand address format
    if (!/^[A-Z2-7]{58}$/.test(address)) {
      return new Response(
        JSON.stringify({ error: "Invalid Algorand address format" }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Call the TestNet dispenser
    const dispenserResponse = await fetch('https://dispenser.testnet.aws.algodev.network/dispense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `account=${address}`,
    });

    if (!dispenserResponse.ok) {
      const errorText = await dispenserResponse.text();
      console.error('Dispenser error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fund from dispenser",
          details: errorText 
        }),
        {
          status: dispenserResponse.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const result = await dispenserResponse.text();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Funding request sent successfully",
        details: result 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Fund wallet error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});