<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep SmartPark demo state in a shared React context across routes, because this frontend-only prototype has no connected parking hardware or backend.
- Use separate TanStack route files for operator sections and the driver view, because each view needs a direct URL and its own metadata.
