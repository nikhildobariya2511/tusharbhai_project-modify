"use client";

import dynamic from "next/dynamic";
import { PDFViewer } from "@react-pdf/renderer";
import sampleData from "../../../data/sampleData";
import InvoicePDF from "../../../components/pdfToReport/InvoicePDF";
// import sampleData from "@/data/sampleData";
// import InvoicePDF from "@/components/pdfToReport/InvoicePDF";

const PreviewPage = () => {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <PDFViewer style={{ width: "100%", height: "100%" }}>
                <InvoicePDF data={sampleData} />
            </PDFViewer>
        </div>
    );
};

// Prevent SSR – PDFViewer must run only in browser
export default dynamic(() => Promise.resolve(PreviewPage), { ssr: false });
