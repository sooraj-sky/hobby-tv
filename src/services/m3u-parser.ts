import type { Channel } from '../types';

export class M3UParser {
    static parse(content: string): Channel[] {
        const lines = content.split('\n');
        const channels: Channel[] = [];
        let currentChannel: Partial<Channel> = {};

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith('#EXTINF:')) {
                // Parse metadata
                // Example: #EXTINF:-1 tvg-id="cnn.us" tvg-name="CNN" tvg-logo="..." group-title="News",CNN US
                const info = line.substring(8);
                const commaIndex = info.lastIndexOf(',');
                const name = info.substring(commaIndex + 1).trim();
                const storedProps = info.substring(0, commaIndex);

                const tvgId = this.getAttribute(storedProps, 'tvg-id');
                const tvgName = this.getAttribute(storedProps, 'tvg-name');
                const logo = this.getAttribute(storedProps, 'tvg-logo');
                const group = this.getAttribute(storedProps, 'group-title');
                const language = this.getAttribute(storedProps, 'tvg-language');

                currentChannel = {
                    name: name || tvgName || 'Unknown Channel',
                    tvgId: tvgId,
                    logo: logo,
                    group: group,
                    language: language,
                };
            } else if (!line.startsWith('#')) {
                // It's a URL
                if (currentChannel.name) {
                    // Generate a simple ID if tvg-id is missing
                    const id = currentChannel.tvgId || btoa(line).substring(0, 12); // simple hash of url

                    channels.push({
                        id: id,
                        name: currentChannel.name,
                        logo: currentChannel.logo,
                        group: currentChannel.group,
                        language: currentChannel.language,
                        tvgId: currentChannel.tvgId,
                        url: line
                    });
                    currentChannel = {};
                }
            }
        }

        return channels;
    }

    private static getAttribute(text: string, attr: string): string | undefined {
        const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
        const match = text.match(regex);
        return match ? match[1] : undefined;
    }
}
