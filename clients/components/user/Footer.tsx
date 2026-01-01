import Image from 'next/image'
import React from 'react'
import styles from './Footer.module.css';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer')
    return (
        <footer className='flex relative justify-center bg-black  text-white pt-12 '>
            <div className="container px-4 md:px-8">
                <div className="flex flex-col  md:flex-row  md:justify-between">
                    {/* Left column (col-12 col-md-7) */}
                    <div className="w-full md:w-8/12">
                        <h4 className="text-[30px]  font-normal leading-tight">
                            {t('largestProvider')}
                        </h4>
                        <p className="mt-2 text-[16px] md:text-base text-[#d0d5dd]">
                            {t('joinCommunity')}
                        </p>
                    </div>

                    {/* Right column (col-12 col-md-5) */}
                    <div className="w-full md:w-4/12 mt-4 md:mt-0 flex flex-col sm:flex-row items-center sm:items-center justify-center md:justify-end gap-2">
                        <a
                            href="https://www.igi.org/contact-us/"
                            className="
       w-full sm:w-auto sm:min-w-[80px]           
      text-center bg-[#465b5d] text-white text-[16px]
      border border-[#344054] rounded-[2px]
      h-9 flex items-center justify-center           
      px-4                                           
      hover:bg-white hover:text-[#475467] transition-colors duration-700
      mx-2 sm:mx-1                                   
    "
                        >
                            {t('contactIgi')}
                        </a>
                    </div>

                </div>
                <div className="pt-12 mt-12 pb-4">
                    <div className="">
                        <div className="flex lg:flex-row flex-col justify-end lg:justify-between px-0 pb-6 md:px-4">
                            <div className="flex flex-col pr-3 pb-12 md:pb-0">
                                <a className="footer-logo max-w-[125px] mb-4" href="https://www.igi.org">
                                    <Image
                                        src="https://www.igi.org/wp-content/themes/bootscore-child/img/logo/igi-footer-logo.svg"
                                        alt="logo"
                                        width={100}
                                        height={100}
                                        className='w-full h-full'
                                    // className="logo logo-main xs"
                                    />
                                </a>

                                <p className="max-w-[300px] text-[#d0d5dd] text-[16px] mb-4">
                                    {t('largestCertification')}
                                </p>
                            </div>

                            <div className="text-[#d0d5dd] text-[16px]">
                                {/* <div
                                // className="inline-flex md items-start justify-start lg:justify-end footer-nav flex-wrap lg:flex-nowrap"
                                // footer-menu-list d-inline-flex flex-md-row align-items-start justify-content-start justify-content-lg-end footer-nav flex-wrap flex-lg-nowrap 
                                className="flex  md:flex-row items-center justify-start lg:justify-end flex-wrap lg:flex-nowrap"
                            > */}
                                {/* Outer list wrapper added for semantic structure but li classes/IDs are preserved */}
                                {/* <ul className="list-none m-0 p-0 flex flex-col md:flex-row md:space-x-6 lg:space-x-8"> */}
                                <ul className="list-none flex  md:flex-row  justify-start lg:justify-end flex-wrap lg:flex-nowrap">
                                    <li
                                        className="mb-5 w-[48%]"
                                    >
                                        <a href="https://www.igi.org/reports/" className='text-[15px]'>{t('reports')}</a>
                                        <ul className="list-none m-0 p-0 text-[12px]">
                                            <li id="menu-item-8859" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/reports/">{t('igiReports')}</a>
                                            </li>
                                            <li id="menu-item-8656" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/reports/diamond-reports/">{t('diamondReports')}</a>
                                            </li>
                                            <li id="menu-item-8657" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/reports/jewelry-reports/">{t('jewelryReports')}</a>
                                            </li>
                                            <li id="menu-item-8658" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/services/appraisals/">{t('appraisals')}</a>
                                            </li>
                                            <li id="menu-item-8659" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/diamond-grading-process/">{t('gradingProcess')}</a>
                                            </li>
                                        </ul>
                                    </li>

                                    <li
                                        id="menu-item-4421"
                                        className="mb-5 w-[48%]"
                                    >
                                        <a href="https://www.igi.org/school-of-gemology/" className='text-[15px]' >{t('schoolOfGemology')}</a>
                                        <ul className="list-none m-0 p-0 text-[12px]">
                                            <li id="menu-item-8872" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology/">{t('learnToday')}</a>
                                            </li>
                                            <li id="menu-item-26849" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="/education/elearning/courses/">{t('eLearning')}</a>
                                            </li>
                                            <li id="menu-item-4422" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology/graduate-programs/">{t('gemologyGraduatePrograms')}</a>
                                            </li>
                                            <li id="menu-item-4424" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology/webinars/">{t('webinars')}</a>
                                            </li>
                                            <li id="menu-item-8873" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology/workshops/">{t('workshops')}</a>
                                            </li>
                                            <li id="menu-item-22605" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology-contact/">{t('schoolInquiry')}</a>
                                            </li>
                                            <li id="menu-item-33686" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/school-of-gemology-contact/">{t('requestHelp')}</a>
                                            </li>
                                        </ul>
                                    </li>

                                    <li
                                        id="menu-item-4420"
                                        className="mb-5 w-[48%]"
                                    >
                                        <a href="https://www.igi.org/consumer-education/" className='text-[15px]'>{t('consumerEducation')}</a>
                                        <ul className="list-none m-0 p-0 text-[12px]">
                                            <li id="menu-item-4425" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/consumer-education/learn-with-videos/">{t('learnWithVideos')}</a>
                                            </li>
                                            <li id="menu-item-17220" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/glossary/">{t('glossary')}</a>
                                            </li>
                                            <li id="menu-item-24272" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="/how-to-read-an-igi-natural-diamond-report/">{t('readGradingReport')}</a>
                                            </li>
                                        </ul>
                                    </li>

                                    <li
                                        id="menu-item-4426"
                                        className="mb-5 w-[48%]"
                                    >
                                        <a href="https://www.igi.org/services/" className='text-[15px]'>{t('services')}</a>
                                        <ul className="list-none m-0 p-0 text-[12px]">
                                            <li id="menu-item-27265" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/services/what-we-do/diamond-screening/">{t('screeningServices')}</a>
                                            </li>
                                            <li id="menu-item-27264" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/services/what-we-do/diamond-sorting/">{t('sortingServices')}</a>
                                            </li>
                                            <li id="menu-item-27262" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/services/what-we-do/laserscribe/">{t('laserscribe')}</a>
                                            </li>
                                            <li id="menu-item-8863" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="https://www.igi.org/services/what-we-do/registration-recovery/">{t('registration')}</a>
                                            </li>
                                            <li id="menu-item-22550" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="noopener noreferrer" href="https://api.igi.org/">
                                                    {t('apiReportsPdfs')}
                                                </a>
                                            </li>
                                            <li id="menu-item-39464" className={`${styles.menuItemTypePostType} `}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' href="/blockchain-based-digital-diamond-certificate-ddc/">
                                                    {t('blockchainDdc')}
                                                </a>
                                            </li>
                                        </ul>
                                    </li>

                                    <li
                                        className="mb-5 w-[48%]"
                                    >
                                        <a data-uw-rm-kbnav="anohref" className='text-[15px]' tabIndex={0}>
                                            {t('policies')}
                                        </a>
                                        <ul className="list-none m-0 p-0 text-[12px]">
                                            <li id="menu-item-28141" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="noopener noreferrer" href="https://www.igi.org/assets/pdf/IGI-Human-Rights-Policy-2025.pdf">
                                                    {t('humanRightsPolicy')}
                                                </a>
                                            </li>
                                            <li id="menu-item-28142" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="noopener noreferrer" href="https://www.igi.org/assets/pdf/Code-of-Conduct.pdf">
                                                    {t('codeOfConduct')}
                                                </a>
                                            </li>
                                            <li id="menu-item-28143" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="noopener noreferrer" href="https://www.igi.org/assets/pdf/Supplier-Code-of-Conduct.pdf">
                                                    {t('supplierCodeOfConduct')}
                                                </a>
                                            </li>
                                            <li id="menu-item-28144" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="noopener noreferrer" href="https://www.igi.org/assets/pdf/IGI-NA-RJC-Policy.pdf">
                                                    {t('rjcPolicy')}
                                                </a>
                                            </li>
                                            <li id="menu-item-28145" className={`${styles.menuItemTypePostType}`}>
                                                <a className='whitespace-nowrap overflow-hidden text-ellipsis' target="_blank" rel="privacy-policy noopener noreferrer" href="https://www.igi.org/privacy-policy/">
                                                    {t('privacyPolicy')}
                                                </a>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="">
                        {/* Wrapper row (was: row footer-border pt-1 mt-1 lh-1) */}
                        <div className="w-full sm:border-t border-[#475467]  pt-1 mt-1 leading-none">
                            <div className="w-full  pb-4 mt-4 copyright flex justify-between flex-col-reverse md:flex-row md:px-0">

                                {/* Copyright text (was: <span class="py-3">...) */}
                                <span className="py-4 text-[16px] ">
                                    {t('copyright')}
                                </span>

                                {/* Links + social block (was: d-flex flex-row py-3) */}
                                <div className="flex  flex-row py-4 space-x-4">

                                    {/* Terms links (keeps same hrefs) */}
                                    <a href="/terms-and-conditions/" className="text-[16px]">
                                        {t('termsAndConditions')}
                                    </a>

                                    <a href="/terms-of-use/" className="text-[16px]">
                                        {t('termsOfUse')}
                                    </a>

                                    {/* Social links list (was: list-inline list-unstyled mb-3 m-md-0) */}
                                    <ul className="list-none flex flex-wrap mb-4 ml-[7px]   space-x-3">
                                        <li className="inline-block">
                                            <a
                                                href="https://www.twitter.com/igiworldwide/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={t('twitterAria')}
                                            >
                                                <i className="fab fa-twitter text-[#98a2b3] text-[19.2px] hover:text-[#fff] transition-colors duration-700" aria-hidden="true"></i>
                                            </a>
                                        </li>

                                        <li className="inline-block">
                                            <a
                                                href="https://www.linkedin.com/company/igi-worldwide/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={t('linkedinAria')}
                                            >
                                                <i className="fa-brands fa-linkedin text-[#98a2b3] text-[19.2px] hover:text-[#fff] transition-colors duration-700" aria-hidden="true"></i>
                                            </a>
                                        </li>

                                        <li className="inline-block">
                                            <a
                                                href="https://www.facebook.com/InternationalGemologicalInstitute/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={t('facebookAria')}
                                            >
                                                <i className="fab fa-facebook-f text-[#98a2b3] text-[19.2px] hover:text-[#fff] transition-colors duration-700" aria-hidden="true"></i>
                                            </a>
                                        </li>

                                        <li className="inline-block">
                                            <a
                                                href="https://www.instagram.com/igiworldwide/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={t('instagramAria')}
                                            >
                                                <i className="fa-brands fa-instagram text-[#98a2b3]  text-[19.2px] hover:text-[#fff] transition-colors duration-700" aria-hidden="true"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-[14.4%] border-t border-[#475467] sm:hidden" />
        </footer>
    )
}
