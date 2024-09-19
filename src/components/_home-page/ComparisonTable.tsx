import React from "react";
import { Table } from "~/components/ui/table";
import { CheckIcon, MinusIcon } from "lucide-react";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";

interface PlanFeature {
  type: string;
  features: {
    name: string;
    free: boolean;
    startup: boolean;
    team: boolean;
    enterprise: boolean;
  }[];
}

type PlanKey = "free" | "startup" | "team" | "enterprise";

const planFeatures: PlanFeature[] = [
  {
    type: "Financial data",
    features: [
      {
        name: "Open/High/Low/Close",
        free: true,
        startup: true,
        team: true,
        enterprise: true,
      },
      {
        name: "Price-volume difference indicator	",
        free: true,
        startup: true,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    type: "On-chain data",
    features: [
      {
        name: "Network growth",
        free: true,
        startup: false,
        team: true,
        enterprise: true,
      },
      {
        name: "Average token age consumed",
        free: true,
        startup: false,
        team: true,
        enterprise: true,
      },
      {
        name: "Exchange flow",
        free: false,
        startup: false,
        team: true,
        enterprise: true,
      },
      {
        name: "Total ERC20 exchange funds flow",
        free: false,
        startup: false,
        team: true,
        enterprise: true,
      },
    ],
  },
  {
    type: "Social data",
    features: [
      {
        name: "Dev activity",
        free: false,
        startup: true,
        team: false,
        enterprise: true,
      },
      {
        name: "Topic search",
        free: true,
        startup: true,
        team: true,
        enterprise: true,
      },
      {
        name: "Relative social dominance",
        free: true,
        startup: true,
        team: false,
        enterprise: true,
      },
    ],
  },
];

export default function ComparisonTable() {
  return (
    <>
      <div className="mt-20 lg:mt-32">
        <div className="mb-10 lg:mb-20 lg:text-center">
          <h3 className="text-2xl font-semibold dark:text-white">
            Compare plans
          </h3>
        </div>
        {/* xs to lg */}
        <Table className="hidden lg:table">
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="w-3/12">Plans</TableHead>
              <TableHead className="w-2/12 text-center text-lg font-medium">
                Free
              </TableHead>
              <TableHead className="w-2/12 text-center text-lg font-medium">
                Startup
              </TableHead>
              <TableHead className="w-2/12 text-center text-lg font-medium">
                Team
              </TableHead>
              <TableHead className="w-2/12 text-center text-lg font-medium">
                Enterprise
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planFeatures.map((featureType) => (
              <React.Fragment key={featureType.type}>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-bold">
                    {featureType.type}
                  </TableCell>
                </TableRow>
                {featureType.features.map((feature) => (
                  <TableRow
                    key={feature.name}
                    className="text-muted-foreground"
                  >
                    <TableCell>{feature.name}</TableCell>
                    <TableCell>
                      <div className="mx-auto w-min">
                        {feature.free ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <MinusIcon className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="mx-auto w-min">
                        {feature.startup ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <MinusIcon className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="mx-auto w-min">
                        {feature.team ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <MinusIcon className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="mx-auto w-min">
                        {feature.enterprise ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          <MinusIcon className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        <div className="space-y-24 lg:hidden">
          {(["Free", "Startup", "Team", "Enterprise"] as const).map((plan) => (
            <section key={plan}>
              <div className="mb-4">
                <h4 className="text-xl font-medium">{plan}</h4>
              </div>
              <Table>
                <TableBody>
                  {planFeatures.map((featureType) => (
                    <React.Fragment key={featureType.type}>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableCell colSpan={2} className="w-10/12 font-bold">
                          {featureType.type}
                        </TableCell>
                      </TableRow>
                      {featureType.features.map((feature) => (
                        <TableRow
                          className="text-muted-foreground"
                          key={feature.name}
                        >
                          <TableCell className="w-11/12">
                            {feature.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {feature[plan.toLowerCase() as PlanKey] ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <MinusIcon className="h-5 w-5" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </section>
          ))}
        </div>
        {/* End xs to lg */}
      </div>
    </>
  );
}
