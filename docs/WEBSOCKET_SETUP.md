# WebSocket Real-time Seat Updates Setup

## Overview

This system provides real-time seat locking/unlocking updates across all connected clients using WebSockets. When one user selects or deselects a seat, all other users see the change immediately.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │  WebSocket      │
│   (React)       │    │   Routes        │    │  Server         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ SeatSelection   │◄──►│ /api/seat-locks │◄──►│ Port 8080       │
│ Component       │    │                 │    │ /ws/seat-updates│
│                 │    │ - POST (lock)   │    │                 │
│ useWebSocket    │◄───┤ - DELETE (unlock│    │ Broadcasts to   │
│ SeatUpdates     │    │ - Broadcast via │    │ all subscribers │
│ Hook            │    │   WebSocket     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. WebSocket Server (`src/lib/websocket/server.ts`)
- Standalone WebSocket server on port 8080
- Manages client connections and subscriptions
- Broadcasts seat updates to subscribed clients
- Handles connection/disconnection gracefully

### 2. WebSocket Client Hook (`src/hooks/useWebSocketSeatUpdates.ts`)
- React hook for WebSocket connection management
- Auto-reconnection with exponential backoff
- Real-time seat status updates
- Connection status monitoring

### 3. Updated SeatSelection Component
- Integrates WebSocket updates
- Real-time seat status visualization
- Connection status indicator

### 4. Updated API Routes (`src/app/api/seat-locks/route.ts`)
- Broadcasts seat lock/unlock events via WebSocket
- Converts seat string IDs to database IDs
- Maintains backward compatibility

## Setup Instructions

### 1. Install Dependencies

```bash
npm install ws @types/ws concurrently
```

### 2. Start Development Environment

**Option A: Start both servers together**
```bash
npm run dev:full
```

**Option B: Start servers separately**
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: WebSocket server
npm run ws-server
```

### 3. Verify Setup

1. Open browser to `http://localhost:3000`
2. Navigate to movie showtime selection
3. Check WebSocket connection status (green dot = connected)
4. Open multiple tabs/browsers to test real-time updates

## Usage

### Frontend Integration

```typescript
import { useWebSocketSeatUpdates } from '@/hooks/useWebSocketSeatUpdates';

function SeatSelection({ showtimeId }) {
  const handleSeatUpdate = useCallback((update) => {
    console.log('Seat update:', update);
    // Update UI based on seat status change
  }, []);

  const { isConnected, connectionStatus } = useWebSocketSeatUpdates(
    showtimeId,
    handleSeatUpdate
  );

  return (
    <div>
      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        {connectionStatus}
      </div>
      {/* Seat grid */}
    </div>
  );
}
```

### API Integration

```typescript
// In your API route
import { seatWebSocketServer } from '@/lib/websocket/server';

// After successful seat lock/unlock
seatWebSocketServer.broadcastSeatUpdate({
  type: 'seat_status_change',
  showtimeId: '123',
  seatId: 'A06',
  status: 'locked',
  sessionId: 'user_session_id',
  timestamp: Date.now()
});
```

## Message Types

### Client → Server

```typescript
// Subscribe to showtime updates
{
  type: 'subscribe',
  showtimeId: '123',
  sessionId: 'user_session_id',
  userId?: 'user_id'
}

// Unsubscribe from updates
{
  type: 'unsubscribe',
  showtimeId?: '123'
}
```

### Server → Client

```typescript
// Connection established
{
  type: 'connection_established',
  sessionId: 'ws_session_id',
  timestamp: 1234567890
}

// Subscription confirmed
{
  type: 'subscribed',
  showtimeId: '123',
  timestamp: 1234567890
}

// Seat status change
{
  type: 'seat_status_change',
  showtimeId: '123',
  seatId: 'A06',
  status: 'locked' | 'unlocked' | 'booked',
  sessionId?: 'user_session_id',
  timestamp: 1234567890
}

// Current seat status (on subscribe)
{
  type: 'current_seat_status',
  showtimeId: '123',
  bookedSeats: ['A01', 'A02'],
  lockedSeats: ['A03', 'A04'],
  timestamp: 1234567890
}
```

## Testing

### Manual Testing

1. **Single User Flow:**
   - Select a seat → Should lock immediately
   - Deselect seat → Should unlock immediately

2. **Multi-User Flow:**
   - Open 2 browser tabs
   - Tab 1: Select seat A06
   - Tab 2: Should see A06 as locked (red)
   - Tab 2: Try to select A06 → Should show alert
   - Tab 1: Deselect A06
   - Tab 2: Should see A06 as available

3. **Connection Resilience:**
   - Stop WebSocket server
   - Frontend should show "Connection error"
   - Restart server
   - Frontend should auto-reconnect

### Debugging

**Check WebSocket Connection:**
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8080/ws/seat-updates');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
```

**Check Server Logs:**
```bash
# WebSocket server logs
npm run ws-server

# Look for:
# 🚀 WebSocket server started
# 👤 New WebSocket connection
# 📺 Client subscribed to showtime
# 📢 Broadcasting seat update
```

## Production Deployment

### Environment Variables

```env
# .env.local
WEBSOCKET_SERVER_URL=wss://your-domain.com/ws/seat-updates
WEBSOCKET_SERVER_PORT=8080
```

### Docker Setup

```dockerfile
# Add to your Dockerfile
EXPOSE 8080
CMD ["sh", "-c", "npm run ws-server & npm start"]
```

### Nginx Configuration

```nginx
# WebSocket proxy
location /ws/ {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

## Troubleshooting

### Common Issues

1. **WebSocket connection failed**
   - Check if port 8080 is available
   - Verify WebSocket server is running
   - Check firewall settings

2. **Seat updates not syncing**
   - Check API route is calling `broadcastSeatUpdate()`
   - Verify client is subscribed to correct showtime
   - Check console for WebSocket errors

3. **Multiple connections from same user**
   - Each tab creates separate connection
   - Use sessionId to identify unique sessions
   - Implement session management if needed

### Performance Considerations

- **Connection Limits:** Default limit ~1000 concurrent connections
- **Message Rate:** Throttle rapid seat selections
- **Memory Usage:** Clean up expired subscriptions
- **Scaling:** Use Redis for multi-server deployments
