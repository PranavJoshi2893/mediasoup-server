import { Router } from "mediasoup/node/lib/RouterTypes";
import { config } from "./config"

async function createWebRtcTransport(mediasoupRouter: Router) {
    const { maxIncomeBitrate, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

    const transport = await mediasoupRouter.createWebRtcTransport({
        listenIps: config.mediasoup.webRtcTransport.listenIps,
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate
    })

    if (maxIncomeBitrate) {
        try {
            await transport.setMaxIncomingBitrate(maxIncomeBitrate)
        } catch (err) {
            console.log(err)
        }
    }

    return {
        transport,
        params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
        }
    }

}

export { createWebRtcTransport }