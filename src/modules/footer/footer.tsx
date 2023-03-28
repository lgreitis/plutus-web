import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faDiscord,
  faGithub,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-bg-dark">
      <div className="mx-auto flex w-full max-w-7xl justify-between py-6 px-6 lg:px-8">
        <div className="flex flex-col items-start">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2023 Lukas Greičius. Powered by Steam.
          </p>
          <p className="text-center text-xs leading-5 text-gray-500">
            Support this project on{" "}
            <Link
              className="text-blacfaDiscordk dark:text-neutral-400"
              href="https://ko-fi.com/lgreitis"
              target="_blank"
            >
              ko-fi
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="https://www.linkedin.com/in/lukasgreicius/"
            target="_blank"
          >
            <FontAwesomeIcon icon={faLinkedinIn} className="h-6 w-6" />
          </Link>
          <Link href="https://github.com/lgreitis/" target="_blank">
            <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
          </Link>
          <Link href="https://discord.gg/JhWKDJwPb7/" target="_blank">
            <FontAwesomeIcon icon={faDiscord} className="h-6 w-6" />
          </Link>
          <Link href="mailto:plutus@lukasgreicius.com">
            <FontAwesomeIcon
              icon={faEnvelope as IconProp}
              className="h-6 w-6"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
