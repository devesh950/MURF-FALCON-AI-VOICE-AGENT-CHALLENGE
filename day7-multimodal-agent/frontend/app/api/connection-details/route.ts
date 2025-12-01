import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const roomName = `grocery-order-${Date.now()}`;
  const participantName = `customer-${Math.floor(Math.random() * 10000)}`;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL || "ws://localhost:7880";

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: Missing LiveKit credentials" },
      { status: 500 }
    );
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  // Add metadata to request agent
  token.metadata = JSON.stringify({
    requestAgent: true,
  });

  // Dispatch agent to the room (default agent name used for GET)
  await dispatchAgentToRoom(wsUrl, apiKey, apiSecret, roomName, "QuickMart Grocery Agent");

  return NextResponse.json({
    serverUrl: wsUrl,
    roomName: roomName,
    participantToken: await token.toJwt(),
    participantName: participantName,
  });
}

async function dispatchAgentToRoom(wsUrl: string, apiKey: string, apiSecret: string, roomName: string, agentName: string) {
  try {
    const roomService = new RoomServiceClient(
      wsUrl.replace("ws://", "http://").replace("wss://", "https://"),
      apiKey,
      apiSecret
    );
    await roomService.createRoom({ name: roomName });

    // Dispatch the agent to the room
    await roomService.dispatchAgent({
      room: roomName,
      agentName,
    });

    console.log(`Agent dispatched to room: ${roomName} (agent=${agentName})`);
  } catch (error) {
    console.error("Failed to dispatch agent:", error);
    // Continue - allow the token to be returned even if dispatch failed
  }
}

export async function POST(request: Request) {
  // Accept JSON body to allow the frontend to request a specific agent
  let body: any = null;
  try {
    body = await request.json();
  } catch (err) {
    // Invalid or empty body — fall back to defaults
    body = null;
  }

  const agentName =
    body?.room_config?.agents?.[0]?.agent_name || "QuickMart Grocery Agent";

  const roomName = `grocery-order-${Date.now()}`;
  const participantName = `customer-${Math.floor(Math.random() * 10000)}`;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL || "ws://localhost:7880";

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: Missing LiveKit credentials" },
      { status: 500 }
    );
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  token.metadata = JSON.stringify({ requestAgent: true });

  // Dispatch agent using requested name
  await dispatchAgentToRoom(wsUrl, apiKey, apiSecret, roomName, agentName);

  return NextResponse.json({
    serverUrl: wsUrl,
    roomName: roomName,
    participantToken: await token.toJwt(),
    participantName: participantName,
  });
}
