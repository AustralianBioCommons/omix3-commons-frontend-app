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
              <div key={`title-${index}`} className="mx-20 mt-8 grid grid-cols-1 lg:grid-cols-2">
                <div className="flex justify-center pr-0 text-left lg:pr-10">
                  <Title
                    className={`mb-8 w-full max-w-[44rem] px-0 text-left text-xl font-semibold tracking-tight lg:text-3xl ${index % 2 === 0 ? 'text-primary' : 'text-primary-lighter'}`}
                    order={component.title.level}
                  >
                    {component.title.text}
                  </Title>
                </div>
              </div>
            );
          }

          if (component.splitarea) {
            return (
              <div key={`split-${index}`} className="mx-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
                <div className="flex justify-center pr-0 text-left lg:pr-10">
                  <div className="w-full max-w-[44rem]">
                  {component.splitarea.left.map((item, itemIndex) => {
                    if (item.text) {
                      return (
                        <div
                          key={`text-${itemIndex}`}
                          className="prose mb-5 ml-0 mr-auto max-w-[44rem] !mt-0 text-left sm:prose-lg 2xl:prose-xl"
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
                </div>
                <div className="min-h-[420px] lg:-mt-8">
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
              <div key={`cards-${index}`} className="mx-auto mt-16 w-full max-w-[1500px] px-8 text-center lg:px-12">
                <Title className="my-5" order={3}>
                  {component.cardsArea.title}
                </Title>
                <ul className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-8 !p-0">
                  {component.cardsArea.cards.map((card) => {
                    const Icon = cardIcons[card.icon];

                    return (
                      <li
                        key={card.btnText}
                        className="flex h-[26rem] w-full max-w-[24rem] flex-col items-center justify-center rounded-xl border border-secondary-lightest bg-base-max shadow-lg !p-8"
                      >
                        {Icon ? <Icon className="inline-block text-7xl text-accent-lighter" /> : null}
                        <p className="mb-6 mt-6 block max-w-[30rem] text-center leading-6 text-primary">
                          {card.bodyText}
                        </p>
                        <Gen3ButtonReverse
                          colors="accent-lighter"
                          className="text-base-contrast-lighter"
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
