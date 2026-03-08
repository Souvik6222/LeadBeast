"""
Domain Extractor Tool — extracts company domain from email or URL
WAT Layer 3: Deterministic Tool
"""
import re
from urllib.parse import urlparse


def extract_domain_from_email(email: str) -> str | None:
    """Extract company domain from email address."""
    if not email or '@' not in email:
        return None
    
    domain = email.split('@')[1].lower()
    
    # Extended list of personal/free email providers
    free_providers = {
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
        'icloud.com', 'protonmail.com', 'mail.com', 'yandex.com', 'live.com',
        'msn.com', 'zoho.com', 'gmx.com', 'gmx.net', 'inbox.com', 'mail.ru',
        'fastmail.com', 'tutanota.com', 'tutamail.com', 'pm.me', 'hey.com',
        'hushmail.com', 'lycos.com', 'rocketmail.com', '163.com', 'qq.com',
        'rediffmail.com', 'cox.net', 'sbcglobal.net', 'btinternet.com',
        'mac.com', 'me.com', 'earthlink.net', 'optonline.net', 'comcast.net',
        'verizon.net', 'att.net', 'bellsouth.net', 'charter.net', 'juno.com',
        'netzero.net', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.in', 'yahoo.fr',
        'yahoo.de', 'yahoo.it', 'yahoo.es', 'yahoo.co.jp', 'googlemail.com',
        'web.de', 't-online.de', 'freenet.de', '126.com', 'yeah.net', 'sina.com',
        'sohu.com', 'virgilio.it', 'libero.it', 'alice.it', 'mail.fr', 'laposte.net',
        'orange.fr', 'seznam.cz', 'centrum.cz', 'wp.pl', 'onet.pl', 'interia.pl',
        'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'ukr.net', 'i.ua',
        'meta.ua', 'rambler.ru', 'bk.ru', 'inbox.ru', 'list.ru', 'e1.ru', 'ngs.ru',
        'mail.ee', 'online.no', 'telia.com', 'tele2.se', 'home.nl', 'planet.nl',
        'ziggo.nl', 'kpnmail.nl', 'xs4all.nl', 'telenet.be', 'skynet.be', 'scarlet.be',
        'bluewin.ch', 'hispeed.ch', 'swisscom.com', 'aon.at', 'gmx.at', 'chello.at',
        'bigpond.com', 'optusnet.com.au', 'iinet.net.au', 'xtra.co.nz',
        'shaw.ca', 'sympatico.ca', 'rogers.com', 'videotron.ca', 'telus.net'
    }

    # Extended list of gaming domains
    gaming_domains = {
        'xboxlive.com', 'playstation.com', 'steamcommunity.com', 'nintendo.com',
        'epicgames.com', 'ubisoft.com', 'ea.com', 'blizzard.com', 'riotgames.com',
        'twitch.tv', 'discord.com', 'discordapp.com', 'roblox.com', 'minecraft.net',
        'origin.com', 'battlenet.com', 'rockstargames.com', 'take2games.com',
        'activision.com', 'bungie.net', 'bethesda.net', 'square-enix.com',
        'sega.com', 'capcom.com', 'konami.com', 'bandainamcoent.com', 'nexon.com',
        'ncsoft.com', 'pearlabyss.com', 'smilegate.com', 'tencentgames.com',
        'supercell.com', 'zynga.com', 'king.com', 'playrix.com', 'rovio.com',
        'mojang.com', 'nianticlabs.com', 'garena.com', 'krafton.com', 'pubg.com',
        'riot.com', 'valvesoftware.com', 'gearboxsoftware.com', 'obsidian.net',
        'naughtydog.com', 'insomniac.games', 'infinityward.com', 'treyarch.com',
        'sledgehammergames.com', 'respawn.com', 'bioware.com', 'dice.se'
    }

    if domain in free_providers or domain in gaming_domains or domain.endswith('.edu') or domain.endswith('.ac.uk'):
        return None
    
    return domain


def extract_domain_from_url(url: str) -> str | None:
    """Extract domain from a website URL."""
    if not url:
        return None
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return None


def get_company_domain(email: str = None, website: str = None) -> str | None:
    """Get company domain from email or website, preferring website."""
    domain = None
    
    if website:
        domain = extract_domain_from_url(website)
    
    if not domain and email:
        domain = extract_domain_from_email(email)
    
    return domain
