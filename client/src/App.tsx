import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import FeedPage from "@/pages/FeedPage";
import CompaniesPage from "@/pages/CompaniesPage";
import AwardsPage from "@/pages/AwardsPage";
import SubmitPage from "@/pages/SubmitPage";
import AdminPage from "@/pages/AdminPage";
import PricingPage from "@/pages/PricingPage";
import ForCompaniesPage from "@/pages/ForCompaniesPage";
import TrendsPage from "@/pages/TrendsPage";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <Layout>
            <Switch>
              <Route path="/" component={FeedPage} />
              <Route path="/companies" component={CompaniesPage} />
              <Route path="/awards" component={AwardsPage} />
              <Route path="/submit" component={SubmitPage} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/pricing" component={PricingPage} />
              <Route path="/for-companies" component={ForCompaniesPage} />
              <Route path="/trends" component={TrendsPage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
