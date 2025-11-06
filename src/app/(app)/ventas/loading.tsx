import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SalesLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-64" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

             <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-4 w-72 mb-2" />
                    <Skeleton className="h-5 w-52" />
                </div>
                <Skeleton className="h-10 w-80" />
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                      <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                      <TableHead className="text-right"><Skeleton className="h-4 w-full" /></TableHead>
                      <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(10)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                         <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                        <TableCell>
                           <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-4 w-48" />
              </CardFooter>
            </Card>
        </div>
    )
}
