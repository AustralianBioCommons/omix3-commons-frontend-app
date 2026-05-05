import {
  Gen3Button,
  Gen3ButtonReverse,
  Gen3Link,
  LandingPageGetServerSideProps as getServerSideProps,
  NavPageLayout,
} from '@gen3/frontend';
import type { NavPageLayoutProps } from '@gen3/frontend';
import { Title } from '@mantine/core';
import { MdGroup, MdOutlineBarChart, MdOutlineSearch } from 'react-icons/md';

import ProjectSummaryHero from '../components/Landing/ProjectSummaryHero';

type LandingLink = {
  href: string;
  text: string;
  linkType?: 'portal' | 'gen3ff';
};

type LandingImage = {
  src: string;
  alt: string;
};

type LandingSection = {
  title?: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  splitarea?: {
    left: Array<{
      text?: string;
      link?: LandingLink;
    }>;
    right: Array<{
      image?: LandingImage;
    }>;
  };
  break?: string;
  cardsArea?: {
    title: string;
    cards: Array<{
      icon: 'MdOutlineSearch' | 'MdOutlineBarChart' | 'MdGroup';
      bodyText: string;
      btnText: string;
      href: string;
      linkType?: 'portal' | 'gen3ff';
    }>;
  };
  quoteArea?: {
    quote: string;
    author?: string;
  };
};

type LandingPageConfig = {
  body?: LandingSection[];
};

type Props = NavPageLayoutProps & {
  landingPage: LandingPageConfig;
};

const cardIcons = {
  MdGroup: MdGroup,
  MdOutlineBarChart: MdOutlineBarChart,
  MdOutlineSearch: MdOutlineSearch,
};

const LandingPage = ({ headerProps, footerProps, mainProps, headerMetadata, landingPage }: Props) => {
  return (
    <NavPageLayout
      headerProps={headerProps}
      footerProps={footerProps}
      mainProps={mainProps}
      headerMetadata={headerMetadata}
    >
      <div className="sm:mt-8 2xl:mt-10 w-full bg-base-max">
        {landingPage?.body?.map((component, index) => {
          if (component.title) {
            return (
              <Title
                key={`title-${index}`}
                className={`mb-5 pl-20 pb-2 ${index % 2 === 0 ? 'text-primary' : 'text-primary-lighter'}`}
                order={component.title.level}
              >
                {component.title.text}
              </Title>
            );
          }

          if (component.splitarea) {
            return (
              <div key={`split-${index}`} className="mx-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="pr-0 lg:pr-10">
                  {component.splitarea.left.map((item, itemIndex) => {
                    if (item.text) {
                      return (
                        <div
                          key={`text-${itemIndex}`}
                          className="prose mb-5 !mt-0 sm:prose-base 2xl:prose-lg"
                          dangerouslySetInnerHTML={{ __html: item.text }}
                        />
                      );
                    }

                    if (item.link) {
                      return (
                        <Gen3Button
                          key={`link-${itemIndex}`}
                          colors="accent-lighter"
                          className="mb-5 mr-5 text-accent-contrast-lighter"
                        >
                          <Gen3Link
                            className="flex items-center"
                            href={item.link.href}
                            linkType={item.link.linkType}
                            text={item.link.text}
                            showExternalIcon
                          />
                        </Gen3Button>
                      );
                    }

                    return null;
                  })}
                </div>
                <div className="min-h-[420px]">
                  <ProjectSummaryHero />
                </div>
              </div>
            );
          }

          if (component.break) {
            return <hr key={`break-${index}`} className="border sm:my-10 2xl:my-12" />;
          }

          if (component.cardsArea) {
            return (
              <div key={`cards-${index}`} className="text-center">
                <Title className="my-5" order={3}>
                  {component.cardsArea.title}
                </Title>
                <ul className="mx-20 grid gap-4 !p-0 md:grid-cols-2 xl:grid-cols-4">
                  {component.cardsArea.cards.map((card) => {
                    const Icon = cardIcons[card.icon];

                    return (
                      <li
                        key={card.btnText}
                        className="mx-0 flex flex-col items-center justify-between border shadow-lg !p-5"
                      >
                        {Icon ? <Icon className="inline-block text-7xl text-accent-lighter" /> : null}
                        <p className="mb-2 block leading-6 text-primary">{card.bodyText}</p>
                        <Gen3ButtonReverse
                          colors="accent-lighter"
                          className="mb-5 mr-5 text-base-contrast-lighter"
                        >
                          <Gen3Link href={card.href} linkType={card.linkType} text={card.btnText} />
                        </Gen3ButtonReverse>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }

          if (component.quoteArea) {
            return (
              <div
                key={`quote-${index}`}
                className="bg-secondary-lightest text-center sm:mt-16 sm:p-16 2xl:mt-20 2xl:p-20"
              >
                <div className="sm:text-3xl 2xl:text-4xl">{component.quoteArea.quote}</div>
                {component.quoteArea.author ? <div>{component.quoteArea.author}</div> : null}
              </div>
            );
          }

          return null;
        })}
      </div>
    </NavPageLayout>
  );
};

export default LandingPage;
export { getServerSideProps };
