import type { ReportData } from "@/components/excelToReport/ReportPDF";
import JewelryReportAutoDownloadLauncher from "./JewelryReportAutoDownloadLauncher";
import { Suspense } from "react";
const dummyData = [
    {
        "id": 10,
        "report_no": "20J320130138",
        "description": "One Yellow Gold Pendant, weighing in total 1.59g, containing, Twenty five (25) Natural Diamonds",
        "shape_and_cut": "(25) ROUND Brilliant",
        "tot_est_weight": "0.4",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0144",
        "image_filename": "PD 0144.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:49.469844+05:30"
    },
    {
        "id": 11,
        "report_no": "88J124505553",
        "description": "One Yellow Gold Pendant, weighing in total 1.47g, containing, Fifteen (15) Natural Diamonds",
        "shape_and_cut": "(15) ROUND Brilliant",
        "tot_est_weight": "0.26",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0133",
        "image_filename": "PD 0133.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:49.714174+05:30"
    },
    {
        "id": 12,
        "report_no": "12J263925690",
        "description": "One Yellow Gold Pendant, weighing in total 1.46g, containing, Thirty one (31) Natural Diamonds",
        "shape_and_cut": "(31) ROUND Brilliant",
        "tot_est_weight": "0.3",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0136",
        "image_filename": "PD 0136.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:49.974427+05:30"
    },
    {
        "id": 13,
        "report_no": "16J168268789",
        "description": "One Yellow Gold Pendant, weighing in total 0.85g, containing, Fourteen (14) Natural Diamonds",
        "shape_and_cut": "(14) ROUND Brilliant",
        "tot_est_weight": "0.21",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0143",
        "image_filename": "PD 0143.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:50.194113+05:30"
    },
    {
        "id": 14,
        "report_no": "83J163831502",
        "description": "One Yellow Gold Pendant, weighing in total 1.37g, containing, Twenty four (24) Natural Diamonds",
        "shape_and_cut": "(24) ROUND Brilliant",
        "tot_est_weight": "0.56",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0131",
        "image_filename": "PD 0131.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:50.386517+05:30"
    },
    {
        "id": 15,
        "report_no": "11J281305734",
        "description": "One Yellow Gold Pendant, weighing in total 1.02g, containing, Nine (9) Natural Diamonds",
        "shape_and_cut": "(9) ROUND Brilliant",
        "tot_est_weight": "0.1",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0138",
        "image_filename": "PD 0138.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:50.63888+05:30"
    },
    {
        "id": 16,
        "report_no": "87J112070094",
        "description": "One Yellow Gold Pendant, weighing in total 0.99g, containing, Twenty two (22) Natural Diamonds",
        "shape_and_cut": "(22) ROUND Brilliant",
        "tot_est_weight": "0.22",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0129",
        "image_filename": "PD 0129.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:50.905621+05:30"
    },
    {
        "id": 17,
        "report_no": "30J257118916",
        "description": "One Yellow Gold Pendant, weighing in total 0.94g, containing, Eighteen (18) Natural Diamonds",
        "shape_and_cut": "(18) ROUND Brilliant",
        "tot_est_weight": "0.23",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0142",
        "image_filename": "PD 0142.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:51.170888+05:30"
    },
    {
        "id": 18,
        "report_no": "12J114709424",
        "description": "One Yellow Gold Pendant, weighing in total 1.04g, containing, Thirty (30) Natural Diamonds",
        "shape_and_cut": "(30) ROUND Brilliant",
        "tot_est_weight": "0.36",
        "color": "HI",
        "clarity": "VS-SI",
        "style": "PD 0146",
        "image_filename": "PD 0146.png",
        "comment": null,
        "isecopy": false,
        "created_at": "2025-11-13 21:05:51.452389+05:30"
    }
]

export default function SomePage() {
    return (
        <div>
            <Suspense fallback={<div>Loading report UI…</div>}>
                <JewelryReportAutoDownloadLauncher data={dummyData as any} />
            </Suspense>
        </div>
    );
}
