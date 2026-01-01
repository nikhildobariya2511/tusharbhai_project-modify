type MenuItem = {
  id: string;
  label: string;
  href?: string;
  target?: string;
  children?: MenuItem[];
  external?: boolean;
};

export const menuData: MenuItem[] = [
  {
    id: "about",
    label: "About",
    children: [
      {
        id: "about-igi-story",
        label: "The IGI Story",
        href: "https://www.igi.org/about/about-igi/",
        external: true,
      },
      {
        id: "about-timeline",
        label: "The IGI Timeline",
        href: "https://www.igi.org/about/timeline/",
        external: true,
      },
      {
        id: "about-events",
        label: "IGI Events Near You",
        href: "https://www.igi.org/igi-events/",
        external: true,
      },
      {
        id: "about-magazine",
        label: "D’Origin Magazine",
        href: "https://www.igi.org/magazines/",
        external: true,
      },
      // Press Room had `d-none` in HTML — omitted (or include if you want)
      {
        id: "about-affiliations",
        label: "Affiliations",
        href: "https://www.igi.org/about/affiliations/",
        external: true,
      },
    ],
  },

  {
    id: "reports",
    label: "Reports",
    children: [
      {
        id: "grading-authority",
        label: "The Grading Authority",
        href: "https://www.igi.org/reports/",
        external: true,
      },
      {
        id: "grading-process",
        label: "The Grading Process",
        href: "https://www.igi.org/diamond-grading-process/",
        external: true,
      },
      {
        id: "diamond-reports",
        label: "Diamond Reports",
        href: "https://www.igi.org/reports/diamond-reports/",
        external: true,
        children: [
          {
            id: "natural-diamond-report",
            label: "Natural Diamond Reports",
            href: "https://www.igi.org/reports/natural-diamond-report/",
            external: true,
          },
          {
            id: "lab-grown-diamond-report",
            label: "Lab Grown Diamond Reports",
            href: "https://www.igi.org/reports/lab-grown-diamond-report/",
            external: true,
          },
          {
            id: "light-performance",
            label: "Light Performance Report",
            href: "https://www.igi.org/diamond-grading-process/cut-grading/",
            external: true,
          },
          {
            id: "identification-reports",
            label: "Identification Reports",
            href: "https://www.igi.org/reports/diamond-identification-reports/",
            external: true,
          },
          {
            id: "fancy-colored",
            label: "Fancy Colored Diamond Reports",
            href: "https://www.igi.org/reports/fancy-colored-diamond-report/",
            external: true,
          },
          {
            id: "lab-grown-jewelry-report",
            label: "Lab Grown Diamond Jewelry Reports",
            href: "https://www.igi.org/reports/lab-grown-diamond-report/",
            external: true,
          },
          {
            id: "hearts-arrows",
            label: "Hearts & Arrows Reports",
            href: "https://www.igi.org/reports/hearts-arrows-report/",
            external: true,
          },
        ],
      },
      {
        id: "colored-stone-reports",
        label: "Colored Stone Reports",
        href: "https://www.igi.org/reports/colored-stone-reports/",
        external: true,
      },
      {
        id: "jewelry-reports",
        label: "Jewelry Reports",
        href: "https://www.igi.org/reports/jewelry-reports/",
        external: true,
      },
    ],
  },

  {
    id: "services",
    label: "Services",
    children: [
      {
        id: "services-main",
        label: "Services",
        href: "https://www.igi.org/services/",
        external: true,
      },
      {
        id: "diamond-screening",
        label: "Diamond Screening",
        href: "https://www.igi.org/services/what-we-do/diamond-screening/",
        external: true,
      },
      {
        id: "diamond-sorting",
        label: "Diamond Sorting",
        href: "https://www.igi.org/services/what-we-do/diamond-sorting/",
        external: true,
      },
      {
        id: "duplicate-updated",
        label: "Duplicate/Updated Report (USA only)",
        href: "https://www.igi.org/services/what-we-do/duplicate-updated-report/",
        external: true,
      },
      {
        id: "laserscribe",
        label: "Laserscribe",
        href: "https://www.igi.org/services/what-we-do/laserscribe/",
        external: true,
      },
      {
        id: "registration-recovery",
        label: "Registration & Recovery (USA only)",
        href: "https://www.igi.org/services/what-we-do/registration-recovery/",
        external: true,
      },
      {
        id: "appraisals",
        label: "Appraisals (USA only)",
        href: "https://www.igi.org/services/appraisals/",
        external: true,
      },
      {
        id: "blockchain-ddc",
        label: "Blockchain-Based Digital Diamond Certificate (DDC)",
        href: "/blockchain-based-digital-diamond-certificate-ddc/",
        external: false,
      },
    ],
  },

  {
    id: "school-of-gemology",
    label: "School of Gemology",
    children: [
      {
        id: "course-catalog",
        label: "Course Catalog",
        href: "https://www.igi.org/school-of-gemology/",
        external: true,
      },
      {
        id: "course-schedules",
        label: "Course Schedules",
        href: "https://www.igi.org/course-schedules/",
        external: true,
      },
      {
        id: "graduate-programs",
        label: "Gemology Graduate Programs",
        href: "https://www.igi.org/school-of-gemology/graduate-programs/",
        external: true,
      },
      {
        id: "gem-a-course",
        label: "Gem-A Gemmology Foundation Course",
        href: "/course-category/graduate-programs/gem-a-gemmology-foundation/",
        external: false,
      },
      {
        id: "elearning",
        label: "eLearning",
        href: "/education/elearning/courses/",
        external: false,
      },
      {
        id: "verify-diploma",
        label: "Verify Your Diploma",
        href: "https://www.igi.org/verify-your-diploma/",
        external: true,
      },
      {
        id: "inquire-now",
        label: "Inquire Now",
        href: "https://www.igi.org/school-of-gemology-contact/",
        external: true,
      },
      {
        id: "account",
        label: "Account",
        href: "https://www.igi.org/my-account/",
        external: true,
      },
    ],
  },

  {
    id: "for-consumers",
    label: "For Consumers",
    children: [
      {
        id: "learn-with-igi",
        label: "Learn With IGI",
        href: "https://www.igi.org/consumer-education/",
        external: true,
      },
      {
        id: "learn-with-videos",
        label: "Learn With Videos",
        href: "https://www.igi.org/consumer-education/learn-with-videos/",
        external: true,
      },
      {
        id: "natural-diamonds",
        label: "Natural Diamonds",
        href: "https://www.igi.org/consumer-education/natural-diamonds/",
        external: true,
      },
      {
        id: "appeal-lab-grown",
        label: "The Appeal of Lab grown diamonds",
        href: "https://www.igi.org/lab-grown-diamonds/",
        external: true,
      },
      {
        id: "diamond-4cs",
        label: "Diamond 4Cs",
        href: "https://www.igi.org/consumer-education/diamond-4cs/",
        external: true,
        children: [
          {
            id: "4cs-explained",
            label: "Diamond 4Cs Explained",
            href: "https://www.igi.org/consumer-education/diamond-4cs/",
            external: true,
          },
          {
            id: "carat-weight",
            label: "Carat Weight",
            href: "https://www.igi.org/consumer-education/diamond-4cs/carat-weight/",
            external: true,
          },
          {
            id: "color",
            label: "Color",
            href: "https://www.igi.org/consumer-education/diamond-4cs/diamond-color/",
            external: true,
          },
          {
            id: "cut",
            label: "Cut",
            href: "https://www.igi.org/consumer-education/diamond-4cs/diamond-cut/",
            external: true,
          },
          {
            id: "clarity",
            label: "Clarity",
            href: "https://www.igi.org/consumer-education/diamond-4cs/diamond-clarity/",
            external: true,
          },
        ],
      },
      {
        id: "how-do-i-buy",
        label: "How do I Buy a Diamond?",
        children: [
          {
            id: "how-to-buy-engagement",
            label: "How to Buy a Diamond Engagement Ring",
            href: "https://www.igi.org/how-to-buy-a-diamond-engagement-ring/",
            external: true,
          },
        ],
      },
    ],
  },

  {
    id: "newsroom",
    label: "Newsroom",
    children: [
      {
        id: "gemblog",
        label: "GemBlog",
        href: "https://www.igi.org/category/gemblog/",
        external: true,
      },
      {
        id: "news",
        label: "News",
        href: "https://www.igi.org/category/news/",
        external: true,
      },
      {
        id: "press-releases",
        label: "Press Releases",
        href: "https://www.igi.org/category/press-release/",
        external: true,
      },
      {
        id: "media-room",
        label: "Media Room",
        href: "https://www.igi.org/category/media-room/",
        external: true,
      },
      {
        id: "events",
        label: "Events",
        href: "https://www.igi.org/category/events/",
        external: true,
      },
    ],
  },

  {
    id: "investor",
    label: "Investor",
    href: "https://investor.igi.org/",
    external: true,
    target: "_blank",
  },

  {
    id: "contact",
    label: "Contact",
    href: "https://www.igi.org/contact-us/",
    external: true,
  },
];
