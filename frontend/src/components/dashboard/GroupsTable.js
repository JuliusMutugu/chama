import React from 'react';
import { Card, Table, TableRow, TableCell, TableHead, TableHeaderCell, TableBody, Badge } from '@tremor/react';

const GroupsTable = ({ groups }) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">My Groups</h3>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Group Name</TableHeaderCell>
            <TableHeaderCell>Members</TableHeaderCell>
            <TableHeaderCell>Contribution</TableHeaderCell>
            <TableHeaderCell>Next Payout</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups?.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>{group.memberCount}</TableCell>
              <TableCell>KES {group.contribution.toLocaleString()}</TableCell>
              <TableCell>{group.nextPayout}</TableCell>
              <TableCell>
                <Badge color={group.status === 'Active' ? 'green' : 'yellow'}>
                  {group.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default GroupsTable;
