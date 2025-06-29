namespace Hiraishin.Domain.Utility.Exceptions
{
    public class TooManyRequestsException : Exception
    {
        public List<string>? Errors { get; set; }

        public TooManyRequestsException(string message) : base(message)
        {
            Errors ??= new List<string>();

            Errors.Add(message);
        }

        public TooManyRequestsException(IEnumerable<string> messages)
        {
            Errors ??= new List<string>(messages);
        }

        public TooManyRequestsException(params string[] messages)
        {
            Errors ??= new List<string>(messages);
        }
    }
}