"use client";
import { Link as RouterLink } from "@App/useRouter";
import { cn } from "@/lib/utils";

type NavLinkCompatProps = {
  to?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
};

const NavLink = ({ className, to, href, ...props }: NavLinkCompatProps) => {
  return <RouterLink to={to} href={href} className={cn(className)} {...props} />;
};

export { NavLink };
