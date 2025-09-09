"""Prototype: Advertises Virtual DJ as a network smart speaker.

This module uses Zeroconf (mDNS/Bonjour) to broadcast a simple HTTP
service representing the current Virtual DJ instance. In a full plugin
this would be expanded to implement a real streaming protocol such as
AirPlay or Chromecast. For now it only demonstrates network
advertisement.
"""

from __future__ import annotations

import socket
from dataclasses import dataclass

from zeroconf import ServiceInfo, Zeroconf


@dataclass
class VirtualDJSpeaker:
    """Advertise the current machine as a smart speaker."""

    name: str = "VirtualDJ Smart Speaker"
    port: int = 8009

    def __post_init__(self) -> None:
        self.zeroconf = Zeroconf()
        self.info = ServiceInfo(
            "_http._tcp.local.",
            f"{self.name}._http._tcp.local.",
            addresses=[socket.inet_aton("127.0.0.1")],
            port=self.port,
            properties={b"vdj": b"1"},
        )

    def start(self) -> None:
        """Start advertising the service."""
        self.zeroconf.register_service(self.info)

    def stop(self) -> None:
        """Stop advertising and close Zeroconf."""
        self.zeroconf.unregister_service(self.info)
        self.zeroconf.close()


if __name__ == "__main__":
    speaker = VirtualDJSpeaker()
    speaker.start()
    try:
        input("Advertising VirtualDJ... Press Enter to stop.\n")
    finally:
        speaker.stop()
