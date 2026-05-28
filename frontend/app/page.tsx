import Hero from "../components/Hero";
import ProductDisplay from "../components/ProductDisplay";
import SignupPage from "./signup/page";
import LoginPage from "./login/page";
export default function Home() {
  return (
    <>
      <Hero />
      <ProductDisplay />
      <SignupPage/>
      <LoginPage/>
    </>
  );

  
}