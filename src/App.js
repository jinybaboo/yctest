import { QueryClient, QueryClientProvider} from 'react-query' 
import React from 'react';
import HighChart from './components/HighChart';
React.unstable_disableActingUpdates = true;

const queryClient = new QueryClient();

function App() {

  


  return (
    <QueryClientProvider client={queryClient}>
        {/* <ApexChartTest /> */}
        <HighChart />
    </QueryClientProvider>
  );
}

export default App;

