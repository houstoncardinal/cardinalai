import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import { cn } from '@/lib/utils';

interface PredictiveSuggestionsPanelProps {
  projectId: string | null;
}

const suggestionIcons = {
  next_file: Zap,
  next_action: Zap,
  code_completion: Lightbulb,
  refactoring: RefreshCw,
  optimization: Zap,
};

export const PredictiveSuggestionsPanel: React.FC<PredictiveSuggestionsPanelProps> = ({
  projectId,
}) => {
  const {
    suggestions,
    patterns,
    loading,
    acceptSuggestion,
    rejectSuggestion,
    refreshSuggestions,
  } = usePatternRecognition(projectId);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Predictive Intelligence
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSuggestions}
            disabled={loading}
            className="hover:bg-white/5"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Suggestions */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Suggested Actions
            </h3>
            {suggestions.length === 0 ? (
              <Card className="p-4 bg-white/5 border-white/10">
                <p className="text-sm text-muted-foreground text-center">
                  No suggestions yet. Keep coding to build your pattern profile.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => {
                  const Icon = suggestionIcons[suggestion.suggestion_type] || Lightbulb;

                  return (
                    <Card
                      key={suggestion.id}
                      className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">
                            {suggestion.suggestion_data.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Confidence: {Math.round(suggestion.confidence_score * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acceptSuggestion(suggestion.id)}
                            className="h-8 w-8 p-0 hover:bg-green-500/20"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectSuggestion(suggestion.id)}
                            className="h-8 w-8 p-0 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detected Patterns */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Learned Patterns
            </h3>
            {patterns.length === 0 ? (
              <Card className="p-4 bg-white/5 border-white/10">
                <p className="text-sm text-muted-foreground text-center">
                  No patterns detected yet
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {patterns.slice(0, 5).map((pattern) => (
                  <Card
                    key={pattern.id}
                    className="p-3 bg-white/5 border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {pattern.pattern_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Used {pattern.frequency} times
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{
                              width: `${pattern.confidence_score * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                          {Math.round(pattern.confidence_score * 100)}%
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
