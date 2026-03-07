const translations = {
    en: {
        // Navigation
        nav_home: "Home",
        nav_file: "File Grievance",
        nav_track: "Track",
        nav_whistleblower: "Whistleblower",
        nav_lawyer: "Lawyer Bot",
        nav_dashboard: "Dashboard",
        nav_admin: "Admin",

        // Home
        hero_title: "AI-Powered Grievance Platform",
        hero_subtitle: "Transforming citizen-government accountability with AI-driven transparency",
        hero_cta_file: "File a Grievance",
        hero_cta_track: "Track Status",
        hero_cta_dashboard: "View Dashboard",
        total_grievances: "Total Grievances",
        resolved: "Resolved",
        avg_time: "Avg Resolution",
        sla_breached: "SLA Breaches",

        // File Grievance
        file_title: "File a Grievance",
        file_subtitle: "Describe your complaint and our AI will classify and route it automatically",
        field_title: "Title",
        field_description: "Description",
        field_district: "District",
        field_location: "Location (Optional)",
        field_name: "Your Name (Optional)",
        field_contact: "Contact (Optional)",
        field_anonymous: "File Anonymously",
        btn_submit: "Submit Grievance",
        btn_submitting: "Classifying with AI...",

        // Track
        track_title: "Track Your Grievance",
        track_subtitle: "Enter your tracking ID to check status",
        track_placeholder: "Enter Tracking ID",
        btn_track: "Track",

        // Status labels
        status_open: "Open",
        status_in_progress: "In Progress",
        status_escalated: "Escalated",
        status_resolved: "Resolved",
        status_reopened: "Reopened",

        // Urgency
        urgency_low: "Low",
        urgency_medium: "Medium",
        urgency_high: "High",
        urgency_critical: "Critical",

        // Whistleblower
        whistle_title: "Anonymous Whistleblower",
        whistle_subtitle: "Report corruption or misconduct anonymously. No personal data is collected.",
        whistle_privacy: "🔒 Your identity is completely protected. No IP, name, or contact is stored.",
        whistle_placeholder: "Describe the corruption or misconduct in detail...",
        whistle_submit: "Submit Anonymously",
        whistle_token_msg: "Save this token to track your report:",

        // Lawyer Bot
        lawyer_title: "Citizen Lawyer Bot",
        lawyer_subtitle: "Get AI-powered legal guidance for your grievance",
        lawyer_placeholder: "Describe your grievance or ask a legal question...",
        lawyer_send: "Ask",
        lawyer_category: "Category",

        // Dashboard
        dash_title: "Public Accountability Dashboard",
        dash_subtitle: "Real-time transparency into grievance resolution across departments",
        dash_resolution_rate: "Resolution Rate",
        dash_dept_performance: "Department Performance",
        dash_systemic: "Systemic Issues",
        dash_clusters: "Active Clusters",

        // Admin
        admin_title: "Admin Panel",
        admin_subtitle: "Manage and resolve grievances",
        admin_resolve: "Resolve",
        admin_resolution_notes: "Resolution Notes",

        // Rating
        rate_title: "Rate Resolution",
        rate_submit: "Submit Rating",

        // General
        loading: "Loading...",
        error: "Something went wrong",
        no_data: "No data available",
        language: "Language",
        days: "days",
        hours: "hours",
    },

    hi: {
        nav_home: "होम",
        nav_file: "शिकायत दर्ज करें",
        nav_track: "ट्रैक",
        nav_whistleblower: "व्हिसलब्लोअर",
        nav_lawyer: "वकील बॉट",
        nav_dashboard: "डैशबोर्ड",
        nav_admin: "एडमिन",

        hero_title: "AI-संचालित शिकायत मंच",
        hero_subtitle: "AI-संचालित पारदर्शिता के साथ नागरिक-सरकार जवाबदेही में परिवर्तन",
        hero_cta_file: "शिकायत दर्ज करें",
        hero_cta_track: "स्थिति ट्रैक करें",
        hero_cta_dashboard: "डैशबोर्ड देखें",
        total_grievances: "कुल शिकायतें",
        resolved: "समाधान",
        avg_time: "औसत समय",
        sla_breached: "SLA उल्लंघन",

        file_title: "शिकायत दर्ज करें",
        file_subtitle: "अपनी शिकायत का वर्णन करें और हमारा AI स्वचालित रूप से वर्गीकृत करेगा",
        field_title: "शीर्षक",
        field_description: "विवरण",
        field_district: "जिला",
        field_location: "स्थान (वैकल्पिक)",
        field_name: "आपका नाम (वैकल्पिक)",
        field_contact: "संपर्क (वैकल्पिक)",
        field_anonymous: "गुमनाम रूप से दर्ज करें",
        btn_submit: "शिकायत जमा करें",
        btn_submitting: "AI से वर्गीकृत हो रहा है...",

        track_title: "अपनी शिकायत ट्रैक करें",
        track_subtitle: "स्थिति जानने के लिए ट्रैकिंग ID दर्ज करें",
        track_placeholder: "ट्रैकिंग ID दर्ज करें",
        btn_track: "ट्रैक करें",

        status_open: "खुला",
        status_in_progress: "प्रगति में",
        status_escalated: "बढ़ाया गया",
        status_resolved: "समाधान",
        status_reopened: "पुनः खोला",

        urgency_low: "कम",
        urgency_medium: "मध्यम",
        urgency_high: "उच्च",
        urgency_critical: "गंभीर",

        whistle_title: "गुमनाम व्हिसलब्लोअर",
        whistle_subtitle: "भ्रष्टाचार या कदाचार की गुमनाम रूप से रिपोर्ट करें",
        whistle_privacy: "🔒 आपकी पहचान पूरी तरह सुरक्षित है",
        whistle_placeholder: "भ्रष्टाचार या कदाचार का विस्तार से वर्णन करें...",
        whistle_submit: "गुमनाम रूप से जमा करें",
        whistle_token_msg: "अपनी रिपोर्ट ट्रैक करने के लिए यह टोकन सहेजें:",

        lawyer_title: "नागरिक वकील बॉट",
        lawyer_subtitle: "अपनी शिकायत के लिए AI-संचालित कानूनी मार्गदर्शन प्राप्त करें",
        lawyer_placeholder: "अपनी शिकायत का वर्णन करें...",
        lawyer_send: "पूछें",
        lawyer_category: "श्रेणी",

        dash_title: "सार्वजनिक जवाबदेही डैशबोर्ड",
        dash_subtitle: "विभागों में शिकायत समाधान की वास्तविक पारदर्शिता",
        dash_resolution_rate: "समाधान दर",
        dash_dept_performance: "विभाग प्रदर्शन",
        dash_systemic: "व्यवस्थागत मुद्दे",
        dash_clusters: "सक्रिय क्लस्टर",

        admin_title: "एडमिन पैनल",
        admin_subtitle: "शिकायतों का प्रबंधन और समाधान",
        admin_resolve: "समाधान करें",
        admin_resolution_notes: "समाधान नोट्स",

        rate_title: "समाधान का मूल्यांकन",
        rate_submit: "रेटिंग जमा करें",

        loading: "लोड हो रहा है...",
        error: "कुछ गलत हो गया",
        no_data: "कोई डेटा उपलब्ध नहीं",
        language: "भाषा",
        days: "दिन",
        hours: "घंटे",
    },

    ta: {
        nav_home: "முகப்பு",
        nav_file: "புகார் தாக்கல்",
        nav_track: "கண்காணி",
        nav_whistleblower: "விசில்ப்ளோயர்",
        nav_lawyer: "வழக்கறிஞர் பாட்",
        nav_dashboard: "டாஷ்போர்டு",
        nav_admin: "நிர்வாகி",

        hero_title: "AI-இயக்கும் புகார் தளம்",
        hero_subtitle: "AI-இயக்கும் வெளிப்படைத்தன்மையுடன் குடிமக்கள்-அரசு பொறுப்புணர்வை மாற்றுதல்",
        hero_cta_file: "புகார் தாக்கல் செய்",
        hero_cta_track: "நிலையை கண்காணி",
        hero_cta_dashboard: "டாஷ்போர்டு பார்",
        total_grievances: "மொத்த புகார்கள்",
        resolved: "தீர்க்கப்பட்டது",
        avg_time: "சராசரி நேரம்",
        sla_breached: "SLA மீறல்கள்",

        file_title: "புகார் தாக்கல் செய்",
        file_subtitle: "உங்கள் புகாரை விவரிக்கவும், எங்கள் AI தானாகவே வகைப்படுத்தும்",
        field_title: "தலைப்பு",
        field_description: "விவரம்",
        field_district: "மாவட்டம்",
        field_location: "இடம் (விரும்பினால்)",
        field_name: "உங்கள் பெயர் (விரும்பினால்)",
        field_contact: "தொடர்பு (விரும்பினால்)",
        field_anonymous: "அநாமதேயமாக தாக்கல்",
        btn_submit: "புகார் சமர்ப்பி",
        btn_submitting: "AI வகைப்படுத்துகிறது...",

        track_title: "உங்கள் புகாரை கண்காணி",
        track_subtitle: "நிலை அறிய கண்காணிப்பு ID உள்ளிடவும்",
        track_placeholder: "கண்காணிப்பு ID உள்ளிடவும்",
        btn_track: "கண்காணி",

        status_open: "திறந்துள்ளது",
        status_in_progress: "நடைமுறையில்",
        status_escalated: "உயர்த்தப்பட்டது",
        status_resolved: "தீர்க்கப்பட்டது",
        status_reopened: "மீண்டும் திறக்கப்பட்டது",

        urgency_low: "குறைவு",
        urgency_medium: "நடுத்தரம்",
        urgency_high: "உயர்வு",
        urgency_critical: "அவசரம்",

        whistle_title: "அநாமதேய விசில்ப்ளோயர்",
        whistle_subtitle: "ஊழல் அல்லது முறைகேட்டை அநாமதேயமாக புகாரளிக்கவும்",
        whistle_privacy: "🔒 உங்கள் அடையாளம் முழுமையாக பாதுகாக்கப்படுகிறது",
        whistle_placeholder: "ஊழல் அல்லது முறைகேட்டை விரிவாக விவரிக்கவும்...",
        whistle_submit: "அநாமதேயமாக சமர்ப்பி",
        whistle_token_msg: "உங்கள் புகாரை கண்காணிக்க இந்த டோக்கனை சேமிக்கவும்:",

        lawyer_title: "குடிமக்கள் வழக்கறிஞர் பாட்",
        lawyer_subtitle: "உங்கள் புகாருக்கு AI-இயக்கும் சட்ட வழிகாட்டுதல் பெறுங்கள்",
        lawyer_placeholder: "உங்கள் புகாரை விவரிக்கவும்...",
        lawyer_send: "கேள்",
        lawyer_category: "வகை",

        dash_title: "பொது பொறுப்புணர்வு டாஷ்போர்டு",
        dash_subtitle: "துறைகள் முழுவதும் புகார் தீர்வின் நிகழ்நேர வெளிப்படைத்தன்மை",
        dash_resolution_rate: "தீர்வு விகிதம்",
        dash_dept_performance: "துறை செயல்திறன்",
        dash_systemic: "முறையான சிக்கல்கள்",
        dash_clusters: "செயலில் உள்ள கொத்துகள்",

        admin_title: "நிர்வாகி பேனல்",
        admin_subtitle: "புகார்களை நிர்வகித்து தீர்வு காணுங்கள்",
        admin_resolve: "தீர்வு",
        admin_resolution_notes: "தீர்வு குறிப்புகள்",

        rate_title: "தீர்வை மதிப்பிடுங்கள்",
        rate_submit: "மதிப்பீட்டை சமர்ப்பி",

        loading: "ஏற்றுகிறது...",
        error: "ஏதோ தவறு நடந்தது",
        no_data: "தரவு இல்லை",
        language: "மொழி",
        days: "நாட்கள்",
        hours: "மணி",
    },
};

export const getTranslation = (lang, key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
};

export const t = getTranslation;

export const LANGUAGES = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
];

export const DISTRICTS = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur",
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata",
    "Lucknow", "Jaipur", "Ahmedabad", "Pune", "Patna",
];

export default translations;
