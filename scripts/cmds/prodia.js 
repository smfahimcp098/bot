module.exports = {
  config: {
    name: "prodia",
    version: "1.1",
    author: "Team Calyx",
    role: 0,
    shortDescription: {
      en: 'Text to Image'
    },
    category: "image",
    guide: {
      en: `{pn} your prompt | type models here are \n
1. Guofeng  
2. Absolute Reality v16  
3. Absolute Reality v181  
4. Analog Diffusion 1.0  
5. Anything v3 Pruned  
6. Anything v4.5 Pruned  
7. Anything V5 PrtRE  
8. AOM3A3 Orange Mix  
9. Blazing Drive v10g  
10. Cetus Mix Version 35  
11. Children's Stories v1.3D  
12. Children's Stories v1 Semi-Real  
13. Children's Stories v1 Toon Anime  
14. Counterfeit v30  
15. Cute Yukimix Adorable  
16. Dalcefo v4  
17. Deliberate v2  
18. Deliberate v3  
19. Dreamlike Anime 1.0  
20. Dreamlike Diffusion 1.0  
21. Dreamlike Photoreal 2.0  
22. Dreamshaper 6 Baked VAE  
23. Dreamshaper 7  
24. Dreamshaper 8  
25. Edge of Realism eor v20  
26. Eimis Anime Diffusion V1  
27. Elldreth's Vivid Mix  
28. Epic Realism Natural Sin RC1 VAE  
29. I Can't Believe It's Not Photography  
30. Juggernaut Aftermath  
31. Lofi v4  
32. Lyriel v16  
33. Majic Mix Realistic v4  
34. Mecha Mix v10  
35. Meina Mix v9  
36. Meina Mix v11  
37. Neverending Dream v122  
38. Open Journey V4  
39. Pastel Mix Stylized Anime Pruned FP16  
40. Portrait Plus V1.0  
41. Protogen x34  
42. Realistic Vision V1.4 Pruned FP16  
43. Realistic Vision V2.0  
44. Realistic Vision V4.0  
45. Realistic Vision V5.0  
46. Redshift Diffusion V10  
47. Rev Animated v122  
48. Rundiffusion FX25D v10  
49. Rundiffusion FX v10  
50. SD v1.4  
51. v1.5 Pruned EMA Only  
52. Shonin's Beautiful v10  
53. The Allys Mix II Churned  
54. Timeless 1.0`
    }
  },
  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');

    if (!text) {
      return message.reply("Please provide a prompt with models");
    }

    const [prompt, model] = text.split('|').map((text) => text.trim());
    const modelNumber = model ? model.replace(/[^0-9]/g, '') : "2";
    const ok = "xyz";
    const baseURL = `https://smfahim.${ok}/prodia?prompt=${encodeURIComponent(prompt)}&model=${modelNumber}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const attachment = await global.utils.getStreamFromURL(baseURL);
      message.reply({ attachment });
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error(error);
      message.reply("There was an error processing your request. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};